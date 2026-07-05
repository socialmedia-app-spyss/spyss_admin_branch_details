import { useEffect, useState } from "react";
import { Show } from "@refinedev/mui";
import { useGetIdentity, useShow } from "@refinedev/core";
import { Typography, Box, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { BranchWithMasters } from "../../types/branch";
import { normalizeClassDays } from "./BranchForm";
import { supabaseClient } from "../../supabaseClient";
import type { UserProfile } from "../../types/user";

const formatValue = (value?: string | number | null) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "N/A";

type UserEmailLookup = Record<string, string>;

export const BranchShow = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { query } = useShow<BranchWithMasters>({
    meta: {
      select:
        "*, master_categories(category_name), master_batches(batch_name), master_states(state_name), master_districts(district_name), master_valayas(valaya_name), master_branch_statuses(status_name), master_mediums(medium_name)",
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

    if (userIds.length === 0) {
      setUserEmailsById({});
      return;
    }

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
        Object.fromEntries((profiles ?? []).map((profile) => [profile.id, profile.email])),
      );
    };

    fetchUserEmails();
  }, [record?.created_by, record?.updated_by]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  if (
    isValayaAdmin &&
    record?.valaya_id &&
    !accessibleValayaIds.includes(record.valaya_id)
  ) {
    return (
      <Show title="Branch Details">
        <Typography color="error">You do not have access to view this branch.</Typography>
      </Show>
    );
  }

  const hasCoordinates =
    record?.latitude !== null &&
    record?.latitude !== undefined &&
    record?.longitude !== null &&
    record?.longitude !== undefined;
  const lat = Number(record?.latitude);
  const lng = Number(record?.longitude);
  const coordinateMapLink =
    hasCoordinates && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";
  const googleLocationLink = String(record?.google_location_link ?? "").trim();
  const canOpenGoogleLocationLink = googleLocationLink.startsWith("https://");

  return (
    <Show title="Branch Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">{record?.branch_name}</Typography>

        <Typography>
          <strong>Branch Code:</strong> {formatValue(record?.branch_code)}
        </Typography>
        <Typography>
          <strong>Branch Name:</strong> {formatValue(record?.branch_name)}
        </Typography>
        <Typography>
          <strong>Status:</strong> {formatValue(record?.master_branch_statuses?.status_name)}
        </Typography>
        <Typography>
          <strong>Category:</strong> {formatValue(record?.master_categories?.category_name)}
        </Typography>
        <Typography>
          <strong>Batch:</strong> {formatValue(record?.master_batches?.batch_name)}
        </Typography>
        <Typography>
          <strong>Medium:</strong> {formatValue(record?.master_mediums?.medium_name)}
        </Typography>

        <Typography>
          <strong>Branch Start Date:</strong> {formatValue(record?.branch_start_date)}
        </Typography>
        <Typography>
          <strong>Address:</strong> {formatValue(record?.full_address)}
        </Typography>

        <Typography>
          <strong>Country:</strong> {formatValue(record?.country)}
        </Typography>
        <Typography>
          <strong>State:</strong> {formatValue(record?.master_states?.state_name)}
        </Typography>
        <Typography>
          <strong>District:</strong> {formatValue(record?.master_districts?.district_name)}
        </Typography>
        <Typography>
          <strong>Valaya:</strong> {formatValue(record?.master_valayas?.valaya_name)}
        </Typography>
        <Typography>
          <strong>Area:</strong> {formatValue(record?.area)}
        </Typography>
        <Typography>
          <strong>Pincode:</strong> {formatValue(record?.pincode)}
        </Typography>

        <Typography>
          <strong>Latitude:</strong> {formatValue(record?.latitude)}
        </Typography>
        <Typography>
          <strong>Longitude:</strong> {formatValue(record?.longitude)}
        </Typography>
        <Typography sx={{ overflowWrap: "anywhere" }}>
          <strong>Google Location Link:</strong> {googleLocationLink || "N/A"}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            component="a"
            href={coordinateMapLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            disabled={!coordinateMapLink}
          >
            Test Latitude and Longitude in Google Maps
          </Button>
          <Button
            component="a"
            href={canOpenGoogleLocationLink ? googleLocationLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            disabled={!canOpenGoogleLocationLink}
          >
            Test Google Location Link
          </Button>
        </Box>

        <Typography>
          <strong>Mukhyashikshak:</strong> {formatValue(record?.mukhyashikshak)}
        </Typography>
        <Typography>
          <strong>Contact Number:</strong> {formatValue(record?.contact_number)}
        </Typography>
        <Typography>
          <strong>WhatsApp Number:</strong> {formatValue(record?.whatsapp_number)}
        </Typography>
        <Typography>
          <strong>Email:</strong> {formatValue(record?.email_id)}
        </Typography>
        <Typography>
          <strong>Class Days:</strong> {normalizeClassDays(record?.class_days).join(", ") || "N/A"}
        </Typography>
        <Typography>
          <strong>Class Timings:</strong> {formatValue(record?.class_timings)}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          <strong>Created By:</strong> {record?.created_by ? formatValue(userEmailsById[record.created_by]) : "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Created At:</strong> {formatDateTime(record?.created_at)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Updated By:</strong> {record?.updated_by ? formatValue(userEmailsById[record.updated_by]) : "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Updated At:</strong> {formatDateTime(record?.updated_at)}
        </Typography>
      </Box>
    </Show>
  );
};
