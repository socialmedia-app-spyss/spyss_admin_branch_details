import React from "react";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";

interface UserProfile {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "STATE_ADMIN" | "DISTRICT_ADMIN" | "VALAYA_ADMIN" | "BRANCH_ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isAdminOrSuperAdmin =
    identity?.role === "SUPER_ADMIN" ||
    identity?.role === "STATE_ADMIN" ||
    identity?.role === "DISTRICT_ADMIN" ||
    identity?.role === "VALAYA_ADMIN" ||
    identity?.role === "BRANCH_ADMIN";
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
          {isSuperAdmin && (
            <Grid item>
              <Button
                variant="contained"
                onClick={() => navigate("/users")}
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
