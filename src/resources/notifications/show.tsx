import { Box, Chip, Typography } from "@mui/material";
import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import type { Notification } from "../../types/notification";

const value = (input?: string | number | null) => input === null || input === undefined || input === "" ? "N/A" : input;
const dateTime = (input?: string | null) => input ? new Date(input).toLocaleString() : "N/A";

export const NotificationShow = () => {
  const { query } = useShow<Notification>({ resource: "notifications" });
  const record = query.data?.data;
  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Unable to load notification.</div>;

  return <Show title="Notification Details">
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Typography variant="h5">{value(record?.title_en)}</Typography>
      <Typography><strong>Code:</strong> {value(record?.notification_code)}</Typography>
      <Typography><strong>Version:</strong> {value(record?.version)}</Typography>
      <Box sx={{ display: "flex", gap: 1 }}><Chip label={value(record?.type)} /><Chip label={value(record?.priority)} /></Box>
      <Typography><strong>Title (English):</strong> {value(record?.title_en)}</Typography>
      <Typography><strong>Title (Kannada):</strong> {value(record?.title_kn)}</Typography>
      <Typography sx={{ whiteSpace: "pre-wrap" }}><strong>Body (English):</strong><br />{value(record?.body_en)}</Typography>
      <Typography sx={{ whiteSpace: "pre-wrap" }}><strong>Body (Kannada):</strong><br />{value(record?.body_kn)}</Typography>
      <Typography><strong>Publish Date:</strong> {dateTime(record?.date_time)}</Typography>
      <Typography><strong>Expiry Date:</strong> {dateTime(record?.expiry_date)}</Typography>
      <Typography><strong>Active:</strong> {record?.is_active ? "Yes" : "No"}</Typography>
      <Typography color="text.secondary"><strong>Created:</strong> {dateTime(record?.created_at)}</Typography>
      <Typography color="text.secondary"><strong>Updated:</strong> {dateTime(record?.updated_at)}</Typography>
    </Box>
  </Show>;
};
