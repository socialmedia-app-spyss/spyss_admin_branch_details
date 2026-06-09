import React from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

export const UpcomingEvents: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  const { data: eventsData, isLoading, isError } = useList({
    resource: "events",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "start_date", // Assuming 'start_date' is the field for event date
        order: "asc",
      },
    ],
    filters: [
      {
        field: "start_date",
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
                  primary={event.name}
                  secondary={new Date(event.start_date).toLocaleDateString("en-US", {
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
