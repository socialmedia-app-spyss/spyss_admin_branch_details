import React, { useMemo } from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { UserProfile } from "../../types/user";

type BranchCountRow = {
  id: string;
  district_id?: string | null;
  valaya_id?: string | null;
  master_districts?: {
    district_name?: string | null;
  } | null;
  master_valayas?: {
    valaya_name?: string | null;
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
      select: "id, district_id, valaya_id, master_districts(district_name), master_valayas(valaya_name, valaya_code)",
    },
  });

  const valayaCounts = useMemo<ValayaCount[]>(() => {
    const branches = result?.data ?? [];
    const countsByValaya = new Map<string, ValayaCount>();

    for (const branch of branches) {
      const valayaCode = branch.master_valayas?.valaya_code || branch.valaya_id || "UNKNOWN";
      const valayaName = branch.master_valayas?.valaya_name || "Unknown Valaya";
      const districtId = branch.district_id || "UNKNOWN";
      const districtName = branch.master_districts?.district_name || "Unknown District";

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
  }, [result?.data]);

  if (query.isLoading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography color="error">Error loading Valaya branch counts.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Valaya Wise Branch Count
        </Typography>

        {valayaCounts.length === 0 ? (
          <Typography color="text.secondary">No branches found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {valayaCounts.map((valaya) => (
              <Grid item xs={12} md={6} lg={4} key={valaya.valayaKey}>
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">{valaya.valayaName}</Typography>
                    <Typography variant="h5" color="primary">
                      {valaya.total}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  <Stack spacing={1}>
                    {valaya.districts.map((district) => (
                      <Stack
                        key={district.districtId}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{district.districtName}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {district.count}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
