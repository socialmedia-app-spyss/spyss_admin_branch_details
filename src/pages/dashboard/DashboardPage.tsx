import React from "react";
import { DashboardStats } from "./DashboardStats";
import { ValayaBranchCounts } from "./ValayaBranchCounts";
// import { RecentBranches } from "./RecentBranches";
// import { UpcomingEvents } from "./UpcomingEvents";
// import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import {useGetIdentity} from "@refinedev/core";
// import { RecentNotifications } from "./RecentNotifications"; // Import RecentNotifications

export const DashboardPage: React.FC = () => {
    const { data: currentUser } = useGetIdentity<{ name: string; email: string; role: string }>();
    return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Admin Dashboard, {currentUser?.name || currentUser?.email}!</p>

      <DashboardStats />
      <ValayaBranchCounts />
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
      <QuickActions />
    </div>
  );
};
