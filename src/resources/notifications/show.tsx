import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Notification } from "../../types/notification";

export const NotificationShow = () => {
  const { query } = useShow<Notification>(); // Changed queryResult to query
  const { data, isLoading, isError } = query; // Changed queryResult to query
  const record = data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  return (
    <Show title="Notification Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>
          <strong>Code:</strong> {record?.notification_code}
        </Typography>

        <Typography>
          <strong>Version:</strong> {record?.version}
        </Typography>

        <Typography>
          <strong>Priority:</strong> {record?.priority}
        </Typography>

        <Typography>
          <strong>Type:</strong> {record?.type}
        </Typography>

        <Typography>
          <strong>Title:</strong> {record?.title}
        </Typography>

        <Typography>
          <strong>Body:</strong> {record?.body}
        </Typography>

        <Typography>
          <strong>Active:</strong>{" "}
          {record?.is_active ? "Yes" : "No"}
        </Typography>

        <Typography>
          <strong>Event Date:</strong>{" "}
          {record?.date_time
            ? new Date(record.date_time).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>Expiry Date:</strong>{" "}
          {record?.expiry_date
            ? new Date(record.expiry_date).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>Created At:</strong>{" "}
          {record?.created_at
            ? new Date(record.created_at).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>Updated At:</strong>{" "}
          {record?.updated_at
            ? new Date(record.updated_at).toLocaleString()
            : "N/A"}
        </Typography>
      </Box>
    </Show>
  );
};