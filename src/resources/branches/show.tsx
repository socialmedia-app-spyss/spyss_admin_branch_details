import { useEffect, useState, type ReactNode } from "react";
import { Show } from "@refinedev/mui";
import { useGetIdentity, useShow } from "@refinedev/core";
import { Typography, Box, Button, Card, CardContent, Chip, Divider, Grid, Stack } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { BranchWithMasters } from "../../types/branch";
import { normalizeClassDays } from "./BranchForm";
import { supabaseClient } from "../../supabaseClient";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedName } from "../../utils/i18n";
import type { UserProfile } from "../../types/user";

const formatValue = (value?: string | number | null) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "N/A";

type UserEmailLookup = Record<string, string>;

const DetailItem = ({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) => (
  <Grid item xs={12} md={wide ? 12 : 6}>
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
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2.5}>{children}</Grid>
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
    meta: {
      select: [
        "*",
        "master_categories(category_name_en, category_name_kn)",
        "master_batches(batch_name_en, batch_name_kn)",
        "master_states(state_name_en, state_name_kn)",
        "master_districts(district_name_en, district_name_kn)",
        "master_valayas(valaya_name_en, valaya_name_kn)",
        "master_branch_statuses(status_name_en, status_name_kn)",
        "master_mediums(medium_name_en, medium_name_kn)",
      ].join(", "),
    },
  });

  const { data, isLoading, isError } = query;
  const record = data?.data;
  const [userEmailsById, setUserEmailsById] = useState<UserEmailLookup>({});
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];

  useEffect(() => {
    const userIds = [record?.created_by, record?.updated_by].filter(
      (id): id is string => Boolean(id),
    );
    if (userIds.length === 0) { setUserEmailsById({}); return; }

    const fetchUserEmails = async () => {
      const uniqueUserIds = Array.from(new Set(userIds));
      const { data: profiles, error } = await supabaseClient
        .from("user_profiles")
        .select("id, email")
        .in("id", uniqueUserIds);

      if (error) {
        console.error("BranchShow: Error fetching creator/updater emails:", error);
        setUserEmailsById({});
        return;
      }
      setUserEmailsById(
        Object.fromEntries((profiles ?? []).map((p) => [p.id, p.email])),
      );
    };
    fetchUserEmails();
  }, [record?.created_by, record?.updated_by]);

  if (isLoading) return <div>Loading...</div>;
  if (isError)   return <div>Something went wrong!</div>;

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
    hasCoordinates && Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";

  const googleLocationLink = String(record?.google_location_link ?? "").trim();
  const canOpenGoogleLocationLink = googleLocationLink.startsWith("https://");
  const localized = (english?: string | null, kannada?: string | null) =>
    getLocalizedName(english, kannada, language) || "N/A";
  const branchName = localized(record?.branch_name_en, record?.branch_name_kn);
  const statusName = localized(record?.master_branch_statuses?.status_name_en, record?.master_branch_statuses?.status_name_kn);
  const classDays = normalizeClassDays(record?.class_days)
    .map((day) => language === "kn" ? weekdayNamesKn[day] ?? day : day)
    .join(", ") || "N/A";
  const labels = language === "kn" ? {
    title: "ಶಾಖೆಯ ವಿವರಗಳು", overview: "ಸಾರಾಂಶ", name: "ಶಾಖೆಯ ಹೆಸರು", code: "ಶಾಖೆ ಸಂಕೇತ",
    status: "ಸ್ಥಿತಿ", category: "ವರ್ಗ", batch: "ಬ್ಯಾಚ್", medium: "ಮಾಧ್ಯಮ", startDate: "ಪ್ರಾರಂಭ ದಿನಾಂಕ",
    location: "ಸ್ಥಳ ವಿವರಗಳು", address: "ವಿಳಾಸ", nagara: "ನಗರ", upaNagara: "ಉಪ ನಗರ", country: "ದೇಶ",
    state: "ರಾಜ್ಯ", district: "ಜಿಲ್ಲೆ", valaya: "ವಲಯ", area: "ಪ್ರದೇಶ", pincode: "ಪಿನ್ ಕೋಡ್",
    coordinates: "ಅಕ್ಷಾಂಶ ಮತ್ತು ರೇಖಾಂಶ", map: "ನಕ್ಷೆಯಲ್ಲಿ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ತೆರೆಯಿರಿ", locationLink: "Google ಸ್ಥಳ ತೆರೆಯಿರಿ",
    contact: "ಸಂಪರ್ಕ ವಿವರಗಳು", teacher: "ಮುಖ್ಯಶಿಕ್ಷಕರು", contactNumber: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", whatsapp: "WhatsApp ಸಂಖ್ಯೆ",
    email: "ಇಮೇಲ್", schedule: "ತರಗತಿ ವೇಳಾಪಟ್ಟಿ", classDays: "ತರಗತಿ ದಿನಗಳು", classTimings: "ತರಗತಿ ಸಮಯ",
    audit: "ದಾಖಲೆ ವಿವರಗಳು", createdBy: "ರಚಿಸಿದವರು", createdAt: "ರಚಿಸಿದ ಸಮಯ", updatedBy: "ನವೀಕರಿಸಿದವರು",
    updatedAt: "ನವೀಕರಿಸಿದ ಸಮಯ",
  } : {
    title: "Branch Details", overview: "Overview", name: "Branch Name", code: "Branch Code",
    status: "Status", category: "Category", batch: "Batch", medium: "Medium", startDate: "Branch Start Date",
    location: "Location", address: "Address", nagara: "Nagara", upaNagara: "Upa Nagara", country: "Country",
    state: "State", district: "District", valaya: "Valaya", area: "Area", pincode: "Pincode",
    coordinates: "Latitude and Longitude", map: "Open coordinates in Google Maps", locationLink: "Open Google location",
    contact: "Contact", teacher: "Mukhyashikshak", contactNumber: "Contact Number", whatsapp: "WhatsApp Number",
    email: "Email", schedule: "Class Schedule", classDays: "Class Days", classTimings: "Class Timings",
    audit: "Record Activity", createdBy: "Created By", createdAt: "Created At", updatedBy: "Updated By",
    updatedAt: "Updated At",
  };

  return (
    <Show title={labels.title}>
      <Stack spacing={2.5}>
        <Card sx={{ borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight={700}>{branchName}</Typography>
                <Typography sx={{ mt: 0.5, opacity: 0.85 }}>{formatValue(record?.branch_code)}</Typography>
              </Box>
              <Chip label={statusName} color="success" sx={{ alignSelf: "flex-start", fontWeight: 700 }} />
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6}>
            <DetailSection title={labels.overview}>
              <DetailItem label={labels.name} value={branchName} wide />
              <DetailItem label={labels.code} value={formatValue(record?.branch_code)} />
              <DetailItem label={labels.status} value={statusName} />
              <DetailItem label={labels.category} value={localized(record?.master_categories?.category_name_en, record?.master_categories?.category_name_kn)} />
              <DetailItem label={labels.batch} value={localized(record?.master_batches?.batch_name_en, record?.master_batches?.batch_name_kn)} />
              <DetailItem label={labels.medium} value={localized(record?.master_mediums?.medium_name_en, record?.master_mediums?.medium_name_kn)} />
              <DetailItem label={labels.startDate} value={formatValue(record?.branch_start_date)} />
            </DetailSection>
          </Grid>

          <Grid item xs={12} lg={6}>
            <DetailSection title={labels.contact}>
              <DetailItem label={labels.teacher} value={localized(record?.mukhyashikshak_en, record?.mukhyashikshak_kn)} wide />
              <DetailItem label={labels.contactNumber} value={formatValue(record?.contact_number)} />
              <DetailItem label={labels.whatsapp} value={formatValue(record?.whatsapp_number)} />
              <DetailItem label={labels.email} value={formatValue(record?.email_id)} wide />
            </DetailSection>
          </Grid>

          <Grid item xs={12}>
            <DetailSection title={labels.location}>
              <DetailItem label={labels.address} value={localized(record?.full_address_en, record?.full_address_kn)} wide />
              <DetailItem label={labels.area} value={localized(record?.area_en, record?.area_kn)} />
              <DetailItem label={labels.nagara} value={localized(record?.nagara_en, record?.nagara_kn)} />
              <DetailItem label={labels.upaNagara} value={localized(record?.upa_nagara_en, record?.upa_nagara_kn)} />
              <DetailItem label={labels.country} value={formatValue(record?.country)} />
              <DetailItem label={labels.state} value={localized(record?.master_states?.state_name_en, record?.master_states?.state_name_kn)} />
              <DetailItem label={labels.district} value={localized(record?.master_districts?.district_name_en, record?.master_districts?.district_name_kn)} />
              <DetailItem label={labels.valaya} value={localized(record?.master_valayas?.valaya_name_en, record?.master_valayas?.valaya_name_kn)} />
              <DetailItem label={labels.pincode} value={formatValue(record?.pincode)} />
              <DetailItem label={labels.coordinates} value={hasCoordinates ? `${record?.latitude}, ${record?.longitude}` : "N/A"} wide />
              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button component="a" href={coordinateMapLink || undefined} target="_blank" rel="noopener noreferrer"
                    variant="outlined" startIcon={<OpenInNewIcon />} disabled={!coordinateMapLink}>{labels.map}</Button>
                  <Button component="a" href={canOpenGoogleLocationLink ? googleLocationLink : undefined}
                    target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}
                    disabled={!canOpenGoogleLocationLink}>{labels.locationLink}</Button>
                </Stack>
              </Grid>
            </DetailSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailSection title={labels.schedule}>
              <DetailItem label={labels.classDays} value={classDays} wide />
              <DetailItem label={labels.classTimings} value={formatValue(record?.class_timings)} wide />
            </DetailSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailSection title={labels.audit}>
              <DetailItem label={labels.createdBy} value={record?.created_by ? formatValue(userEmailsById[record.created_by]) : "N/A"} />
              <DetailItem label={labels.createdAt} value={formatDateTime(record?.created_at)} />
              <DetailItem label={labels.updatedBy} value={record?.updated_by ? formatValue(userEmailsById[record.updated_by]) : "N/A"} />
              <DetailItem label={labels.updatedAt} value={formatDateTime(record?.updated_at)} />
            </DetailSection>
          </Grid>
        </Grid>
      </Stack>
    </Show>
  );
};
