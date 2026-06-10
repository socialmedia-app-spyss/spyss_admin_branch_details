import React from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

export const UpcomingEvents: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  const { query: { data: eventsData, isLoading, isError } } = useList({ // Corrected destructuring
    resource: "events",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "start_datetime", // Changed to 'start_datetime'
        order: "asc",
      },
    ],
    filters: [
      {
        field: "start_datetime", // Changed to 'start_datetime'
        operator: "gte", // Greater than or equal to today
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
            {events.map((event: any) => (
              <ListItem key={event.id}>
                <ListItemText
                  primary={event.event_name} // Changed to event.event_name
                  secondary={new Date(event.start_datetime).toLocaleDateString("en-US", { // Changed to event.start_datetime
                    month: "short",
                    day: "numeric",
                  })}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No upcoming events found.</Typography>
        )}
      </CardContent>
    </Card>
  );
};