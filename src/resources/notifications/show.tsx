import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Notification } from "../../types/notification";

export const NotificationShow = () => {
  const { query } = useShow<Notification>(); // Corrected destructuring to queryResult
  const record = query?.data?.data; // Access data from queryResult.data.data

  return (
    <Show title="Notification Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">{record?.title}</Typography>
        <Typography variant="body1"><strong>notification Code:</strong> {record?.notification_code}</Typography>
        <Typography variant="body1"><strong>version:</strong> {record?.version}</Typography>
        <Typography variant="body1"><strong>priority:</strong> {record?.priority}</Typography>
        <Typography variant="body1"><strong>type:</strong> {record?.type}</Typography>
        <Typography variant="body1"><strong>title:</strong> {record?.title}</Typography>
        <Typography variant="body1"><strong>body:</strong> {record?.body}</Typography>
        <Typography variant="body1"><strong>is_active:</strong> {record?.is_active}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Created At:</strong> {record?.created_at ? new Date(record.created_at).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Updated At:</strong> {record?.updated_at ? new Date(record.updated_at).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>expiryDate:</strong> {record?.expiry_date ? new Date(record.expiry_date).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>dateTime:</strong> {record?.date_time ? new Date(record.date_time).toLocaleString() : "N/A"}</Typography>
      </Box>
    </Show>
  );
};
