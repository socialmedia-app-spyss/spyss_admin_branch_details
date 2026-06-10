import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Typography, Box } from "@mui/material";
import { Event } from "../../types/event";

export const EventShow = () => {
  const { query } = useShow<Event>(); // Changed queryResult to query
  const { data, isLoading, isError } = query; // Changed queryResult to query
  const record = data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  return (
    <Show title="Event Details">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>
          <strong>ID:</strong>
          {record?.id}
        </Typography>

        <Typography>
          <strong>Event Name:</strong>
          {record?.event_name}
        </Typography>

        <Typography>
          <strong>Short Description:</strong>
          {record?.short_description}
        </Typography>

        <Typography>
          <strong>Full Description:</strong>
          {record?.full_description}
        </Typography>

        <Typography>
          <strong>Location:</strong>
          {record?.location}
        </Typography>

        <Typography>
          <strong>Start:</strong>
          {record?.start_datetime
            ? new Date(record.start_datetime).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>End:</strong>
          {record?.end_datetime
            ? new Date(record.end_datetime).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>Registration Link:</strong>
          {record?.registration_link || "N/A"}
        </Typography>

        <Typography>
          <strong>Image URL:</strong>
          {record?.image_url || "N/A"}
        </Typography>

        <Typography>
          <strong>Active:</strong>
          {record?.is_active ? "Yes" : "No"}
        </Typography>

        <Typography>
          <strong>Created At:</strong>
          {record?.created_at
            ? new Date(record.created_at).toLocaleString()
            : "N/A"}
        </Typography>

        <Typography>
          <strong>Updated At:</strong>
          {record?.updated_at
            ? new Date(record.updated_at).toLocaleString()
            : "N/A"}
        </Typography>
      </Box>
    </Show>
  );
};