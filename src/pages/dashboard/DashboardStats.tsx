import React from "react";
import { useList } from "@refinedev/core";
import { Grid, Card, CardContent, Typography, CircularProgress, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();

  // Fetch Branches
  const branchesList = useList({
    resource: "branches",
    pagination: {
      mode: "off",
    },
  });
  const branchesData = branchesList.result?.data;
  const isLoadingBranches = branchesList.query.isLoading;
  const isErrorBranches = branchesList.query.isError;

  // Fetch Events
  const eventsList = useList({
    resource: "events",
    pagination: {
      mode: "off",
    },
  });
  const eventsData = eventsList.result?.data;
  const isLoadingEvents = eventsList.query.isLoading;
  const isErrorEvents = eventsList.query.isError;

  // Fetch all Users
  const usersList = useList({
    resource: "user_profiles",
    pagination: {
      mode: "off",
    },
  });
  const usersData = usersList.result?.data;
  const isLoadingUsers = usersList.query.isLoading;
  const isErrorUsers = usersList.query.isError;

  // Fetch Pending Users
  const pendingUsersList = useList({
    resource: "user_profiles",
    filters: [{ field: "status", operator: "eq", value: "PENDING" }],
    pagination: {
      mode: "off",
    },
  });
  const pendingUsersData = pendingUsersList.result?.data;
  const isLoadingPendingUsers = pendingUsersList.query.isLoading;
  const isErrorPendingUsers = pendingUsersList.query.isError;

  // Fetch Notifications
  const notificationsList = useList({
    resource: "notifications",
    pagination: {
      mode: "off",
    },
  });
  const notificationsData = notificationsList.result?.data;
  const isLoadingNotifications = notificationsList.query.isLoading;
  const isErrorNotifications = notificationsList.query.isError;


  const totalBranches = branchesData?.length ?? 0;
  const totalEvents = eventsData?.length ?? 0;
  const totalUsers = usersData?.length ?? 0;
  const pendingUsers = pendingUsersData?.length ?? 0;
  const totalNotifications = notificationsData?.length ?? 0;


  if (isLoadingBranches || isLoadingEvents || isLoadingUsers || isLoadingPendingUsers || isLoadingNotifications) {
    return <CircularProgress />;
  }

  if (isErrorBranches || isErrorEvents || isErrorUsers || isErrorPendingUsers || isErrorNotifications) {
    return <Typography color="error">Error loading dashboard stats.</Typography>;
  }

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/branches")}>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Branches
              </Typography>
              <Typography variant="h4" color="primary">
                {totalBranches}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/events")}>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Events
              </Typography>
              <Typography variant="h4" color="primary">
                {totalEvents}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/notifications")}>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Notifications
              </Typography>
              <Typography variant="h4" color="primary">
                {totalNotifications}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/users")}>
            <CardContent>
              <Typography variant="h6" component="div">
                Total Users
              </Typography>
              <Typography variant="h4" color="primary">
                {totalUsers}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/users")}> {/* Assuming pending users are managed within the main users list */}
            <CardContent>
              <Typography variant="h6" component="div">
                Pending Users
              </Typography>
              <Typography variant="h4" color="secondary">
                {pendingUsers}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  );
};