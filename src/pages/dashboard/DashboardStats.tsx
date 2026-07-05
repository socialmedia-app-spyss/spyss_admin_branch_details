import React from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import { Grid, Card, CardContent, Typography, CircularProgress, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../../types/user";

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];
  const valayaAccessFilters = isValayaAdmin
    ? accessibleValayaIds.length > 0
      ? [{ field: "valaya_id", operator: "in" as const, value: accessibleValayaIds }]
      : [{ field: "valaya_id", operator: "eq" as const, value: "__no_valaya_access__" }]
    : [];

  // Fetch Branches
  const branchesList = useList({
    resource: "latest_branches",
    filters: valayaAccessFilters,
    pagination: {
      mode: "off",
    },
  });
  const branchesData = branchesList.result?.data;
  const isLoadingBranches = branchesList.query.isLoading;
  const isErrorBranches = branchesList.query.isError;

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

  const totalBranches = branchesData?.length ?? 0;
  const totalUsers = usersData?.length ?? 0;
  const pendingUsers = pendingUsersData?.length ?? 0;

  if (isLoadingBranches || isLoadingUsers || isLoadingPendingUsers) {
    return <CircularProgress />;
  }

  if (isErrorBranches || isErrorUsers || isErrorPendingUsers) {
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
          <CardActionArea onClick={() => navigate("/users")}>
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
