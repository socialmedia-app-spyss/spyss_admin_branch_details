import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Event } from "../../types/event";

export const EventShow = () => {
  const { query } = useShow<Event>(); // Corrected destructuring to queryResult
  const record = query?.data?.data; // Access data from queryResult.data.data

  return (
    <Show title="Event Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">{record?.event_name}</Typography>
        <Typography variant="body1"><strong>ID:</strong> {record?.id}</Typography>
        <Typography variant="body1"><strong>Description:</strong> {record?.short_description}</Typography>
        <Typography variant="body1"><strong>Location:</strong> {record?.full_description}</Typography>
        <Typography variant="body1"><strong>Start Date:</strong> {record?.start_datetime ? new Date(record.start_datetime).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body1"><strong>End Date:</strong> {record?.end_datetime ? new Date(record.end_datetime).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body1"><strong>Location:</strong> {record?.location}</Typography>
        <Typography variant="body1"><strong>registrationLink:</strong> {record?.registration_link}</Typography>
        <Typography variant="body1"><strong>imageUrl:</strong> {record?.image_url}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Created At:</strong> {record?.created_at ? new Date(record.created_at).toLocaleString() : "N/A"}</Typography>
        <Typography variant="body2" color="text.secondary"><strong>Updated At:</strong> {record?.updated_at ? new Date(record.updated_at).toLocaleString() : "N/A"}</Typography>
      </Box>
    </Show>
  );
};
