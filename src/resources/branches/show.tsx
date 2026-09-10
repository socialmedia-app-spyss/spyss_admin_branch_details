import { useEffect, useState, type ReactNode } from "react";
import { Show } from "@refinedev/mui";
import { useGetIdentity, useShow } from "@refinedev/core";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { BranchWithMasters } from "../../types/branch";
import { normalizeClassDays } from "./BranchForm";
import { supabaseClient } from "../../supabaseClient";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedJson } from "../../utils/i18n";
import type { UserProfile } from "../../types/user";

const formatValue = (value?: string | number | null) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "N/A";

type UserProfileLookup = Record<string, string>;

const DetailItem = ({
  label,
  value,
  wide = false,
  cols,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
  cols?: number;
}) => (
  <Grid item xs={12} md={cols ?? (wide ? 12 : 6)}>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ overflowWrap: "anywhere" }}>
      {value}
    </Typography>
  </Grid>
);

const DetailSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2.5}>
        {children}
      </Grid>
    </CardContent>
  </Card>
);

const weekdayNamesKn: Record<string, string> = {
  Monday: "ಸೋಮವಾರ",
  Tuesday: "ಮಂಗಳವಾರ",
  Wednesday: "ಬುಧವಾರ",
  Thursday: "ಗುರುವಾರ",
  Friday: "ಶುಕ್ರವಾರ",
  Saturday: "ಶನಿವಾರ",
  Sunday: "ಭಾನುವಾರ",
};

export const BranchShow = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { language } = useLanguage();

  const { query } = useShow<BranchWithMasters>({
    resource: "app_branches",
    meta: {
      select: [
        "*",
        "master_categories(category_name)",
        "master_batches(batch_name)",
        "master_countries!app_branches_country_id_fkey(country_name)",
        "master_states!fk_branch_country_state(state_name)",
        "master_districts!fk_branch_state_district(district_name)",
        "master_valayas!app_branches_valaya_id_fkey(valaya_name)",
        "master_regions!fk_branch_district_region(region_name)",
        "master_branch_statuses!app_branches_status_id_fkey(status_name)",
        "master_mediums!app_branches_medium_id_fkey(medium_name)",
      ].join(", "),
    },
  });

  const { data, isLoading, isError } = query;
  const record = data?.data;
  const [userNamesById, setUserNamesById] = useState<UserProfileLookup>({});
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds =
    identity?.accessible_valaya_ids && identity.accessible_valaya_ids.length > 0
      ? identity.accessible_valaya_ids
      : identity?.valaya_id
        ? [identity.valaya_id]
        : [];

  useEffect(() => {
    const userIds = [record?.created_by, record?.updated_by].filter(
      (id): id is string => Boolean(id),
    );
    if (userIds.length === 0) {
      setUserNamesById({});
      return;
    }

    const fetchUserNames = async () => {
      const uniqueUserIds = Array.from(new Set(userIds));
      const { data: profiles, error } = await supabaseClient
        .from("user_profiles")
        .select("id, full_name, email")
        .in("id", uniqueUserIds);

      if (error) {
        console.error("BranchShow: Error fetching user profiles:", error);
        setUserNamesById({});
        return;
      }
      setUserNamesById(
        Object.fromEntries(
          (profiles ?? []).map((p) => [
            p.id,
            p.full_name ? `${p.full_name} (${p.email})` : p.email,
          ]),
        ),
      );
    };
    fetchUserNames();
  }, [record?.created_by, record?.updated_by]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something went wrong!</div>;

  if (isValayaAdmin && record?.valaya_id && !accessibleValayaIds.includes(record.valaya_id)) {
    return (
      <Show title="Branch Details">
        <Typography color="error">You do not have access to view this branch.</Typography>
      </Show>
    );
  }

  const lat = Number(record?.latitude);
  const lng = Number(record?.longitude);
  const hasCoordinates = record?.latitude != null && record?.longitude != null;
  const coordinateMapLink =
    hasCoordinates &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";

  const googleLocationLink = String(record?.google_location_link ?? "").trim();
  const canOpenGoogleLocationLink = googleLocationLink.startsWith("https://");

  const branchName = getLocalizedJson(record?.branch_name, language) || "N/A";
  const fullAddress = getLocalizedJson(record?.full_address, language) || "N/A";
  const areaName = getLocalizedJson(record?.area, language) || "N/A";
  const nagaraName = getLocalizedJson(record?.nagara, language) || "—";
  const upaNagaraName = getLocalizedJson(record?.upa_nagara, language) || "—";
  const teacherName = getLocalizedJson(record?.mukhyashikshak, language) || "N/A";

  const statusName = getLocalizedJson(record?.master_branch_statuses?.status_name, language) || "N/A";
  const regionName = getLocalizedJson(record?.master_regions?.region_name, language) || "N/A";

  const classDays = normalizeClassDays(record?.class_days)
    .map((day) => (language === "kn" ? weekdayNamesKn[day] ?? day : day))
    .join(", ") || "N/A";

  const labels =
    language === "kn"
      ? {
          title: "ಶಾಖೆಯ ವಿವರಗಳು",
          jurisdiction: "ಪ್ರದೇಶ (Region)",
          overview: "ಶಾಖೆಯ ವಿವರಗಳು",
          name: "ಶಾಖೆಯ ಹೆಸರು",
          code: "ಶಾಖೆ ಸಂಕೇತ",
          status: "ಸ್ಥಿತಿ",
          activeStatus: "ಸಕ್ರಿಯತೆ",
          category: "ವರ್ಗ",
          batch: "ಬ್ಯಾಚ್",
          medium: "ಮಾಧ್ಯಮ",
          startDate: "ಪ್ರಾರಂಭ ದಿನಾಂಕ",
          version: "ಆವೃತ್ತಿ",
          location: "ವಿಳಾಸ ಮತ್ತು ಸ್ಥಳ ವಿವರಗಳು",
          address: "ವಿಳಾಸ",
          nagara: "ನಗರ",
          upaNagara: "ಉಪ ನಗರ",
          country: "ದೇಶ",
          state: "ರಾಜ್ಯ",
          district: "ಜಿಲ್ಲೆ",
          valaya: "ವಲಯ",
          region: "ವಲಯ ವಿಭಾಗ (ರೀಜನ್)",
          area: "ಪ್ರದೇಶ",
          pincode: "ಪಿನ್ ಕೋಡ್",
          coordinates: "ಅಕ್ಷಾಂಶ ಮತ್ತು ರೇಖಾಂಶ",
          map: "ನಕ್ಷೆಯಲ್ಲಿ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ತೆರೆಯಿರಿ",
          locationLink: "Google ಸ್ಥಳ ತೆರೆಯಿರಿ",
          contact: "ಸಂಪರ್ಕ ವಿವರಗಳು",
          teacher: "ಮುಖ್ಯಶಿಕ್ಷಕರು",
          contactNumber: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",
          whatsapp: "WhatsApp ಸಂಖ್ಯೆ",
          spyssHelpline: "SPYSS ಮುಖ್ಯ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ",
          email: "ಇಮೇಲ್",
          schedule: "ತರಗತಿ ವೇಳಾಪಟ್ಟಿ",
          classDays: "ತರಗತಿ ದಿನಗಳು",
          classTimings: "ತರಗತಿ ಸಮಯ",
          audit: "ದಾಖಲೆ ವಿವರಗಳು",
          createdBy: "ರಚಿಸಿದವರು",
          createdAt: "ರಚಿಸಿದ ಸಮಯ",
          updatedBy: "ನವೀಕರಿಸಿದವರು",
          updatedAt: "ನವೀಕರಿಸಿದ ಸಮಯ",
        }
      : {
          title: "Branch Details",
          jurisdiction: "Region",
          overview: "Branch Details",
          name: "Branch Name",
          code: "Branch Code",
          status: "Status",
          activeStatus: "Active Status",
          category: "Category",
          batch: "Batch",
          medium: "Medium",
          startDate: "Branch Start Date",
          version: "Version",
          location: "Address & Map Location",
          address: "Address",
          nagara: "Nagara",
          upaNagara: "Upa Nagara",
          country: "Country",
          state: "State",
          district: "District",
          valaya: "Valaya",
          region: "Region (Zone)",
          area: "Area",
          pincode: "Pincode",
          coordinates: "Latitude and Longitude",
          map: "Open coordinates in Google Maps",
          locationLink: "Open Google location",
          contact: "Contact",
          teacher: "Mukhyashikshak",
          contactNumber: "Contact Number",
          whatsapp: "WhatsApp Number",
          spyssHelpline: "SPYSS Main Contact Number",
          email: "Email",
          schedule: "Class Schedule",
          classDays: "Class Days",
          classTimings: "Class Timings",
          audit: "Record Activity",
          createdBy: "Created By",
          createdAt: "Created At",
          updatedBy: "Updated By",
          updatedAt: "Updated At",
        };

  return (
    <Show title={labels.title}>
      <Stack spacing={2.5}>
        <Card sx={{ borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {branchName}
                </Typography>
                <Typography sx={{ mt: 0.5, opacity: 0.85 }}>
                  {formatValue(record?.branch_code)} • Version {record?.version ?? 1}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignSelf: "flex-start" }}>
                <Chip
                  label={record?.is_active ? "Active" : "Inactive"}
                  color={record?.is_active ? "success" : "default"}
                  sx={{ fontWeight: 700, bgcolor: record?.is_active ? "success.light" : "grey.400" }}
                />
                <Chip label={statusName} color="primary" variant="outlined" sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.2)" }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          {/* SECTION 1: REGION (AT START) */}
          <Grid item xs={12}>
            <DetailSection title={labels.jurisdiction}>
              <DetailItem
                label={labels.country}
                value={getLocalizedJson(record?.master_countries?.country_name, language) || "N/A"}
                cols={6}
              />
              <DetailItem
                label={labels.state}
                value={getLocalizedJson(record?.master_states?.state_name, language) || "N/A"}
                cols={6}
              />
              <DetailItem
                label={labels.valaya}
                value={getLocalizedJson(record?.master_valayas?.valaya_name, language) || "N/A"}
                cols={4}
              />
              <DetailItem
                label={labels.district}
                value={getLocalizedJson(record?.master_districts?.district_name, language) || "N/A"}
                cols={4}
              />
              <DetailItem label={labels.region} value={regionName || "—"} cols={4} />
            </DetailSection>
          </Grid>

          <Grid item xs={12} lg={6}>
            <DetailSection title={labels.overview}>
              <DetailItem label={labels.name} value={branchName} wide />
              <DetailItem label={labels.code} value={formatValue(record?.branch_code)} />
              <DetailItem label={labels.status} value={statusName} />
              <DetailItem
                label={labels.category}
                value={getLocalizedJson(record?.master_categories?.category_name, language) || "N/A"}
              />
              <DetailItem
                label={labels.batch}
                value={getLocalizedJson(record?.master_batches?.batch_name, language) || "N/A"}
              />
              <DetailItem
                label={labels.medium}
                value={getLocalizedJson(record?.master_mediums?.medium_name, language) || "N/A"}
              />
              <DetailItem label={labels.classTimings} value={formatValue(record?.class_timings)} />
              <DetailItem label={labels.classDays} value={classDays} wide />
              <DetailItem label={labels.startDate} value={formatValue(record?.branch_start_date)} />
              <DetailItem label={labels.activeStatus} value={record?.is_active ? "Active" : "Inactive"} />
            </DetailSection>
          </Grid>

          <Grid item xs={12} lg={6}>
            <DetailSection title={labels.contact}>
              <DetailItem label={labels.teacher} value={teacherName} wide />
              <DetailItem label={labels.contactNumber} value={formatValue(record?.contact_number)} />
              <DetailItem label={labels.whatsapp} value={formatValue(record?.whatsapp_number)} />
              <DetailItem label={labels.spyssHelpline} value={formatValue(record?.spyss_main_contact_number)} wide />
              <DetailItem label={labels.email} value={formatValue(record?.email_id)} wide />
            </DetailSection>
          </Grid>

          <Grid item xs={12}>
            <DetailSection title={labels.location}>
              <DetailItem label={labels.address} value={fullAddress} wide />
              <DetailItem label={labels.area} value={areaName} />
              <DetailItem label={labels.nagara} value={nagaraName} />
              <DetailItem label={labels.upaNagara} value={upaNagaraName} />
              <DetailItem label={labels.pincode} value={formatValue(record?.pincode)} />
              <DetailItem
                label={labels.coordinates}
                value={hasCoordinates ? `${record?.latitude}, ${record?.longitude}` : "N/A"}
                wide
              />
              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    component="a"
                    href={coordinateMapLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    disabled={!coordinateMapLink}
                  >
                    {labels.map}
                  </Button>
                  <Button
                    component="a"
                    href={canOpenGoogleLocationLink ? googleLocationLink : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    disabled={!canOpenGoogleLocationLink}
                  >
                    {labels.locationLink}
                  </Button>
                </Stack>
              </Grid>
            </DetailSection>
          </Grid>

          <Grid item xs={12}>
            <DetailSection title={labels.audit}>
              <DetailItem
                label={labels.createdBy}
                value={record?.created_by ? formatValue(userNamesById[record.created_by]) : "N/A"}
                cols={3}
              />
              <DetailItem label={labels.createdAt} value={formatDateTime(record?.created_at)} cols={3} />
              <DetailItem
                label={labels.updatedBy}
                value={record?.updated_by ? formatValue(userNamesById[record.updated_by]) : "N/A"}
                cols={3}
              />
              <DetailItem label={labels.updatedAt} value={formatDateTime(record?.updated_at)} cols={3} />
            </DetailSection>
          </Grid>
        </Grid>
      </Stack>
    </Show>
  );
};
