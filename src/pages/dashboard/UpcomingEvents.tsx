import React from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

export const UpcomingEvents: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  const { query: { data: eventsData, isLoading, isError } } = useList({ // Corrected destructuring
    resource: "app_events",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "start_datetime",
        order: "asc",
      },
    ],
    filters: [
      {
        field: "start_datetime",
        operator: "gte",
        value: today.toISOString(),
      },
    ],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error loading upcoming events.</Typography>
        </CardContent>
      </Card>
    );
  }

  const events = eventsData?.data || [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Upcoming Events
        </Typography>
        {events.length > 0 ? (
          <List>
            {events.map((event: any) => {
              const title =
                event.title?.en ||
                event.title?.kn ||
                event.event_name_en ||
                event.event_name ||
                event.event_code ||
                "Event";
              return (
                <ListItem key={event.id}>
                  <ListItemText
                    primary={title}
                    secondary={new Date(event.start_datetime).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography>No upcoming events found.</Typography>
        )}
      </CardContent>
    </Card>
  );
};