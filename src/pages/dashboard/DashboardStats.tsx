import React from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import { Grid, Card, CardContent, Typography, CircularProgress, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../../types/user";
import { NO_VALAYA_ACCESS_ID } from "../../services/valayaScope";

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds =
    identity?.accessible_valaya_ids && identity.accessible_valaya_ids.length > 0
      ? identity.accessible_valaya_ids
      : identity?.valaya_id
        ? [identity.valaya_id]
        : [];
  const valayaAccessFilters = isValayaAdmin
    ? accessibleValayaIds.length > 0
      ? [{ field: "valaya_id", operator: "in" as const, value: accessibleValayaIds }]
      : [{ field: "valaya_id", operator: "eq" as const, value: NO_VALAYA_ACCESS_ID }]
    : [];

  // Fetch Branches
  const branchesList = useList({
    resource: "app_branches",
    filters: valayaAccessFilters,
    pagination: {
      mode: "off",
    },
  });
  const branchesData = branchesList.result?.data;
  const isLoadingBranches = branchesList.query.isLoading;
  const isErrorBranches = branchesList.query.isError;

  const totalBranches = branchesData?.length ?? 0;

  if (isLoadingBranches) {
    return <CircularProgress />;
  }

  if (isErrorBranches) {
    return <Typography color="error">Error loading dashboard stats.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
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
    </Grid>
  );
};
