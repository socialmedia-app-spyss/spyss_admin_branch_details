import React from "react";
import { Button, Stack } from "@mui/material";
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
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button variant="contained" onClick={() => navigate("/branches/create")} disabled={!isAdminOrSuperAdmin}>
        + Create Branch
      </Button>
          {isSuperAdmin && (
            <>
              <Button variant="contained" onClick={() => navigate("/notifications/create")}>
                + Create Notification
              </Button>
              <Button variant="contained" onClick={() => navigate("/events/create")}>
                + Create Event
              </Button>
              <Button variant="outlined" onClick={() => navigate("/users")}>
                Manage Admin Users
              </Button>
            </>
          )}
    </Stack>
  );
};
