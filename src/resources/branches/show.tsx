import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Branch } from "../../types/branch";

export const BranchShow = () => {
  const { query } = useShow<Branch>(); // Corrected destructuring to queryResult
  const record = query?.data?.data; // Access data from queryResult.data.data

  return (
    <Show title="Branch Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">{record?.branch_name}</Typography>
        <Typography variant="body1"><strong>ID:</strong> {record?.id}</Typography>
        <Typography variant="body1"><strong>Address:</strong> {record?.address}</Typography>
        <Typography variant="body1"><strong>Country:</strong> {record?.country_code_or_name}</Typography>
        <Typography variant="body1"><strong>State:</strong> {record?.admin_level_1}</Typography>
        <Typography variant="body1"><strong>City:</strong> {record?.city}</Typography>
        <Typography variant="body1"><strong>Area:</strong> {record?.admin_level_3}</Typography>
        <Typography variant="body1"><strong>Latitude:</strong> {record?.latitude}</Typography>
        <Typography variant="body1"><strong>Longitude:</strong> {record?.longitude}</Typography>
        <Typography variant="body1"><strong>Mukhyashikshak:</strong> {record?.mukhyashikshak_name}</Typography>
        <Typography variant="body1"><strong>Class Timings:</strong> {record?.class_timings}</Typography>
        <Typography variant="body1"><strong>Contact:</strong> {record?.contact_no}</Typography>
        <Typography variant="body1"><strong>Category:</strong> {record?.category}</Typography>
        <Typography variant="body1"><strong>Batch:</strong> {record?.batch}</Typography>
        <Typography variant="body1"><strong>Active:</strong> {record?.is_active ? "Yes" : "No"}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Created At:</strong> {record?.created_at}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Updated At:</strong> {record?.updated_at}</Typography>
      </Box>
    </Show>
  );
};
