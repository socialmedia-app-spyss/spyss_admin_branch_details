import React from "react";
import { DashboardStats } from "./DashboardStats";
import { RecentBranches } from "./RecentBranches";
import { UpcomingEvents } from "./UpcomingEvents";
import { PendingApprovals } from "./PendingApprovals";
import { QuickActions } from "./QuickActions";
import { RecentNotifications } from "./RecentNotifications"; // Import RecentNotifications

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the SPYSS Admin Panel Dashboard!</p>

      <DashboardStats />
      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <RecentBranches />
        </div>
        <div style={{ flex: 1 }}>
          <UpcomingEvents />
        </div>
        <div style={{ flex: 1 }}>
          <RecentNotifications /> {/* Add RecentNotifications */}
        </div>
      </div>
      <PendingApprovals />
      <QuickActions />
    </div>
  );
};