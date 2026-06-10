import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Branch } from "../../types/branch";

export const BranchShow = () => {
  const { query } = useShow<Branch>();
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
          <strong>Status:</strong> {record?.is_active ? "Active" : "Inactive"}
        </Typography>
        <Typography>
          <strong>Category:</strong> {record?.category}
        </Typography>
        <Typography>
          <strong>Batch:</strong> {record?.batch}
        </Typography>

        <Typography>
          <strong>Address:</strong> {record?.address}
        </Typography>

        <Typography>
          <strong>Country:</strong> {record?.country_code_or_name}
        </Typography>
        <Typography>
          <strong>State:</strong> {record?.admin_level_1}
        </Typography>
        <Typography>
          <strong>City:</strong> {record?.city}
        </Typography>
        <Typography>
          <strong>Area:</strong> {record?.admin_level_3}
        </Typography>

        <Typography>
          <strong>Latitude:</strong> {record?.latitude}
        </Typography>
        <Typography>
          <strong>Longitude:</strong> {record?.longitude}
        </Typography>

        <Typography>
          <strong>Mukhyashikshak:</strong> {record?.mukhyashikshak_name}
        </Typography>
        <Typography>
          <strong>Contact Number:</strong> {record?.contact_no}
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