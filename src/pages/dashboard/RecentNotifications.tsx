import React from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box } from "@mui/material";

export const RecentNotifications: React.FC = () => {
  // Mock data for recent notifications
  const notifications = [
    { id: 1, message: "New branch 'Feature/Login' created by John Doe.", time: "2 hours ago" },
    { id: 2, message: "Event 'Annual Gala' updated by Jane Smith.", time: "Yesterday" },
    { id: 3, message: "User 'Alice Brown' registered.", time: "2 days ago" },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Recent Notifications
        </Typography>
        {notifications.length > 0 ? (
          <List dense>
            {notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.time}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recent notifications.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
