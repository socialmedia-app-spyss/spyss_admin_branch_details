import React from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
}

export const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isSuperAdmin = identity?.role === "SUPER_ADMIN";

  const { data: pendingUsersData, isLoading, isError } = useList({
    resource: "user_profiles",
    filters: [{ field: "status", operator: "eq", value: "PENDING" }],
    config: {
      hasPagination: false,
    },
    queryOptions: {
      enabled: isSuperAdmin, // Only fetch if the user is a SUPER_ADMIN
    },
  });

  if (!isSuperAdmin) {
    return null; // Don't render anything if not a SUPER_ADMIN
  }

  if (isLoading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography color="error">Error loading pending approvals.</Typography>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = pendingUsersData?.data.length || 0;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Pending Approvals
        </Typography>
        {pendingCount > 0 ? (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {pendingCount} user(s) awaiting approval.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/admin/users")}>
              Manage Users →
            </Button>
          </>
        ) : (
          <Typography>No users awaiting approval.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
