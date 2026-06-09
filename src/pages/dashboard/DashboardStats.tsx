import React from "react";
import { useList } from "@refinedev/core";
import { Grid, Card, CardContent, Typography, CircularProgress, CardActionArea } from "@mui/material"; // Added CardActionArea
import { useNavigate } from "react-router-dom"; // Import useNavigate

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const { data: branchesData, isLoading: isLoadingBranches, isError: isErrorBranches } = useList({
    resource: "branches",
    config: {
      hasPagination: false,
    },
  });

  const { data: eventsData, isLoading: isLoadingEvents, isError: isErrorEvents } = useList({
    resource: "events",
    config: {
      hasPagination: false,
    },
  });

  const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers } = useList({
    resource: "user_profiles",
    config: {
      hasPagination: false,
    },
  });

  const { data: pendingUsersData, isLoading: isLoadingPendingUsers, isError: isErrorPendingUsers } = useList({
    resource: "user_profiles",
    filters: [{ field: "status", operator: "eq", value: "PENDING" }],
    config: {
      hasPagination: false,
    },
  });

  const totalBranches = branchesData?.data.length || 0;
  const totalEvents = eventsData?.data.length || 0;
  const totalUsers = usersData?.data.length || 0;
  const pendingUsers = pendingUsersData?.data.length || 0;

  if (isLoadingBranches || isLoadingEvents || isLoadingUsers || isLoadingPendingUsers) {
    return <CircularProgress />;
  }

  if (isErrorBranches || isErrorEvents || isErrorUsers || isErrorPendingUsers) {
    return <Typography color="error">Error loading dashboard stats.</Typography>;
  }

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardActionArea onClick={() => navigate("/branches")}> {/* Added CardActionArea and onClick */}
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
          <CardActionArea onClick={() => navigate("/events")}> {/* Added CardActionArea and onClick */}
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
          <CardActionArea onClick={() => navigate("/users")}> {/* Updated path to /users */}
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
          <CardActionArea onClick={() => navigate("/approvals")}> {/* Added CardActionArea and onClick */}
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