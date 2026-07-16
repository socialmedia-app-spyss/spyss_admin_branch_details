import React from "react";
import { DashboardStats } from "./DashboardStats";
import { ValayaBranchCounts } from "./ValayaBranchCounts";
// import { RecentBranches } from "./RecentBranches";
// import { UpcomingEvents } from "./UpcomingEvents";
// import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import {useGetIdentity} from "@refinedev/core";
import { RecentNotifications } from "./RecentNotifications";
import { NotificationStats } from "./NotificationStats";
import { EventStats } from "./EventStats";
import { UserStats } from "./UserStats";
import { Box, Stack, Typography } from "@mui/material";

export const DashboardPage: React.FC = () => {
    const { data: currentUser } = useGetIdentity<{ name: string; email: string; role: string }>();
    return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
          <Typography color="text.secondary">Welcome, {currentUser?.name || currentUser?.email}</Typography>
        </Box>
        <QuickActions />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, px: 2, py: 1.25, borderRadius: 1, bgcolor: "primary.main", color: "primary.contrastText" }}>
          Branch Overview
        </Typography>
        <DashboardStats />
        <ValayaBranchCounts />
      </Box>

      {currentUser?.role === "SUPER_ADMIN" && (
        <>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, px: 2, py: 1.25, borderRadius: 1, bgcolor: "info.main", color: "info.contrastText" }}>
              Event Overview
            </Typography>
            <EventStats />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, px: 2, py: 1.25, borderRadius: 1, bgcolor: "warning.main", color: "warning.contrastText" }}>
              Notification Overview
            </Typography>
            <NotificationStats />
            <RecentNotifications />
          </Box>
        </>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, px: 2, py: 1.25, borderRadius: 1, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
          User Overview
        </Typography>
        <UserStats />
      </Box>
      {/*<div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>*/}
      {/*  <div style={{ flex: 1 }}>*/}
      {/*    <RecentBranches />*/}
      {/*  </div>*/}
      {/*  <div style={{ flex: 1 }}>*/}
      {/*    <UpcomingEvents />*/}
      {/*  </div>*/}
      {/*  <div style={{ flex: 1 }}>*/}
      {/*    <RecentNotifications /> /!* Add RecentNotifications *!/*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/*<PendingApprovals />*/}
    </Box>
  );
};
