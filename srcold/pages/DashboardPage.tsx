import React, { useEffect } from "react";
import { useUserRole } from "../hooks/useUserRole";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLogout, useGetIdentity } from "@refinedev/core";

const DashboardPage: React.FC = () => {
  const { loading, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { data: currentUser } = useGetIdentity<{ name: string; email: string; role: string }>();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/access-denied");
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return null; // The useEffect will handle the redirection
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Admin Dashboard, {currentUser?.name || currentUser?.email}!
      </Typography>
      <Typography variant="body1" paragraph>
        This is your central hub for managing the SPYSS application. Here you can
        monitor key metrics, manage users, and oversee content.
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => logout()}
        sx={{ mt: 2, mb: 4 }}
      >
        Logout
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                User Overview
              </Typography>
              <Typography variant="body2">
                Total Users: [Count]
              </Typography>
              <Typography variant="body2">
                Pending Approvals: [Count]
              </Typography>
              <Typography variant="body2">
                Active Admins: [Count]
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Content Statistics
              </Typography>
              <Typography variant="body2">
                Total Branches: [Count]
              </Typography>
              <Typography variant="body2">
                Upcoming Events: [Count]
              </Typography>
              <Typography variant="body2">
                Recent Notifications: [Count]
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                System Health
              </Typography>
              <Typography variant="body2">
                API Status: Operational
              </Typography>
              <Typography variant="body2">
                Database Connections: Stable
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        <Button variant="contained" sx={{ mr: 2 }}>Manage Users</Button>
        <Button variant="contained" sx={{ mr: 2 }}>Add New Branch</Button>
        <Button variant="contained">Create Event</Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;