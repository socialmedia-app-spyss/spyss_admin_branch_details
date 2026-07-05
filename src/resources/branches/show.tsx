import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { BranchWithMasters } from "../../types/branch";
import { normalizeClassDays } from "./BranchForm";

export const BranchShow = () => {
  const { query } = useShow<BranchWithMasters>({
    meta: {
      select:
        "*, master_categories(category_name), master_batches(batch_name), master_states(state_name), master_districts(district_name), master_valayas(valaya_name), master_branch_statuses(status_name), master_mediums(medium_name)",
    },
  });
  const { data, isLoading, isError } = query;
  const record = data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  return (
    <Show title="Branch Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">{record?.branch_name}</Typography>

        <Typography>
          <strong>Status:</strong> {record?.master_branch_statuses?.status_name}
        </Typography>
        <Typography>
          <strong>Category:</strong> {record?.master_categories?.category_name}
        </Typography>
        <Typography>
          <strong>Batch:</strong> {record?.master_batches?.batch_name}
        </Typography>
        <Typography>
          <strong>Medium:</strong> {record?.master_mediums?.medium_name}
        </Typography>

        <Typography>
          <strong>Address:</strong> {record?.full_address}
        </Typography>

        <Typography>
          <strong>Country:</strong> {record?.country}
        </Typography>
        <Typography>
          <strong>State:</strong> {record?.master_states?.state_name}
        </Typography>
        <Typography>
          <strong>District:</strong> {record?.master_districts?.district_name}
        </Typography>
        <Typography>
          <strong>Valaya:</strong> {record?.master_valayas?.valaya_name}
        </Typography>
        <Typography>
          <strong>Area:</strong> {record?.area}
        </Typography>
        <Typography>
          <strong>Pincode:</strong> {record?.pincode}
        </Typography>

        <Typography>
          <strong>Latitude:</strong> {record?.latitude}
        </Typography>
        <Typography>
          <strong>Longitude:</strong> {record?.longitude}
        </Typography>

        <Typography>
          <strong>Mukhyashikshak:</strong> {record?.mukhyashikshak}
        </Typography>
        <Typography>
          <strong>Contact Number:</strong> {record?.contact_number}
        </Typography>
        <Typography>
          <strong>WhatsApp Number:</strong> {record?.whatsapp_number}
        </Typography>
        <Typography>
          <strong>Email:</strong> {record?.email_id}
        </Typography>
        <Typography>
          <strong>Class Days:</strong> {normalizeClassDays(record?.class_days).join(", ")}
        </Typography>
        <Typography>
          <strong>Class Timings:</strong> {record?.class_timings}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          <strong>Created At:</strong>{" "}
          {record?.created_at
            ? new Date(record.created_at).toLocaleString()
            : "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Updated At:</strong>{" "}
          {record?.updated_at
            ? new Date(record.updated_at).toLocaleString()
            : "N/A"}
        </Typography>
      </Box>
    </Show>
  );
};
