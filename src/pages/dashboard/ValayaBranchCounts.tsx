import React, { useMemo } from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { UserProfile } from "../../types/user";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedName } from "../../utils/i18n";

type BranchCountRow = {
  id: string;
  district_id?: string | null;
  valaya_id?: string | null;
  master_districts?: {
    district_name_en?: string | null;
    district_name_kn?: string | null;
  } | null;
  master_valayas?: {
    valaya_name_en?: string | null;
    valaya_name_kn?: string | null;
    valaya_code?: string | null;
  } | null;
};

type DistrictCount = {
  districtId: string;
  districtName: string;
  count: number;
};

type ValayaCount = {
  valayaKey: string;
  valayaName: string;
  total: number;
  districts: DistrictCount[];
};

export const ValayaBranchCounts: React.FC = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { language } = useLanguage();
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];
  const valayaAccessFilters = isValayaAdmin
    ? accessibleValayaIds.length > 0
      ? [{ field: "valaya_id", operator: "in" as const, value: accessibleValayaIds }]
      : [{ field: "valaya_id", operator: "eq" as const, value: "__no_valaya_access__" }]
    : [];
  const { result, query } = useList<BranchCountRow>({
    resource: "latest_branches",
    filters: valayaAccessFilters,
    pagination: {
      mode: "off",
    },
    meta: {
      select: "id, district_id, valaya_id, master_districts(district_name_en, district_name_kn), master_valayas(valaya_name_en, valaya_name_kn, valaya_code)",
    },
  });

  const valayaCounts = useMemo<ValayaCount[]>(() => {
    const branches = result?.data ?? [];
    const countsByValaya = new Map<string, ValayaCount>();

    for (const branch of branches) {
      const valayaCode = branch.master_valayas?.valaya_code || branch.valaya_id || "UNKNOWN";
      const valayaName = getLocalizedName(branch.master_valayas?.valaya_name_en, branch.master_valayas?.valaya_name_kn, language) || "Unknown Valaya";
      const districtId = branch.district_id || "UNKNOWN";
      const districtName = getLocalizedName(branch.master_districts?.district_name_en, branch.master_districts?.district_name_kn, language) || "Unknown District";

      if (!countsByValaya.has(valayaCode)) {
        countsByValaya.set(valayaCode, {
          valayaKey: valayaCode,
          valayaName,
          total: 0,
          districts: [],
        });
      }

      const valayaCount = countsByValaya.get(valayaCode);

      if (!valayaCount) {
        continue;
      }

      valayaCount.total += 1;

      let districtCount = valayaCount.districts.find((district) => district.districtId === districtId);

      if (!districtCount) {
        districtCount = {
          districtId,
          districtName,
          count: 0,
        };
        valayaCount.districts.push(districtCount);
      }

      districtCount.count += 1;
    }

    return Array.from(countsByValaya.values())
      .map((valaya) => ({
        ...valaya,
        districts: [...valaya.districts].sort((a, b) => a.districtName.localeCompare(b.districtName)),
      }))
      .sort((a, b) => a.valayaName.localeCompare(b.valayaName));
  }, [language, result?.data]);

  if (query.isLoading) {
    return <CircularProgress size={24} />;
  }

  if (query.isError) {
    return <Typography color="error">Error loading Valaya branch counts.</Typography>;
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle2" color="text.secondary">Valaya-wise count</Typography>
        <Typography variant="body2" fontWeight={650}>{valayaCounts.reduce((total, valaya) => total + valaya.total, 0)} branches</Typography>
      </Stack>
      {valayaCounts.length === 0 ? <Typography color="text.secondary">No branches found.</Typography> : valayaCounts.map((valaya) => (
        <Box key={valaya.valayaKey} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.75 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700}>{valaya.valayaName}</Typography>
            <Typography variant="h6" color="primary.main" fontWeight={750}>{valaya.total}</Typography>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.75}>
            {valaya.districts.map((district) => (
              <Stack key={district.districtId} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{district.districtName}</Typography>
                <Typography variant="body2" fontWeight={650}>{district.count}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
