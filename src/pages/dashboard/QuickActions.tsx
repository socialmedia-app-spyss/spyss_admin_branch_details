import React from "react";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";

interface UserProfile {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isAdminOrSuperAdmin = identity?.role === "ADMIN" || identity?.role === "SUPER_ADMIN";
  const isSuperAdmin = identity?.role === "SUPER_ADMIN";

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/branches/create")}
              disabled={!isAdminOrSuperAdmin}
            >
              + Create Branch
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/events/create")}
              disabled={!isAdminOrSuperAdmin}
            >
              + Create Event
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/notifications/create")}
              disabled={!isAdminOrSuperAdmin}
            >
              + Create Notification
            </Button>
          </Grid>
          {isSuperAdmin && (
            <Grid item>
              <Button
                variant="contained"
                onClick={() => navigate("/users")} // Updated route to /users
              >
                Manage Admin Users
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};