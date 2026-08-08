import { Box, Paper, Stack, Typography } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import type { ReactNode } from "react";
import type { UserProfile } from "../../types/user";
import { AttentionPanel } from "./AttentionPanel";
import { EventStats } from "./EventStats";
import { NotificationStats } from "./NotificationStats";
import { OverviewStats } from "./OverviewStats";
import { PanchangaStats } from "./PanchangaStats";
import { QuickActions } from "./QuickActions";
import { RecentNotifications } from "./RecentNotifications";
import { ValayaBranchCounts } from "./ValayaBranchCounts";

const DashboardSection = ({
  title,
  subtitle,
  children,
  backgroundColor,
  borderColor,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backgroundColor: string;
  borderColor: string;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: 2.5,
      bgcolor: backgroundColor,
      borderColor,
    }}
  >
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
    {children}
  </Paper>
);

export const DashboardPage = () => {
  const { data: currentUser } = useGetIdentity<UserProfile & { name?: string }>();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isPanchangaAdmin = currentUser?.role === "PANCHANGA_ADMIN";
  const indiaHour = Number(new Intl.DateTimeFormat("en-IN", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()).split(":")[0]);
  const greeting = indiaHour < 12 ? "Good morning" : indiaHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto", pb: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={750}>{greeting},</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25 }}>
            {currentUser?.full_name || currentUser?.name || currentUser?.email}
          </Typography>
        </Box>
        <QuickActions />
      </Stack>

      <Stack spacing={2.5}>
        <AttentionPanel />

        {!isPanchangaAdmin && (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Overview</Typography>
            <OverviewStats />
          </Box>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5, alignItems: "start" }}>
          {!isPanchangaAdmin && (
            <DashboardSection
              title="Branch details"
              subtitle="Valaya and district-wise branch counts"
              backgroundColor="#f3f8ff"
              borderColor="#cfe1f8"
            >
              <ValayaBranchCounts />
            </DashboardSection>
          )}
          {(isSuperAdmin || isPanchangaAdmin) && (
            <DashboardSection
              title="Panchanga status"
              subtitle="Approval progress and upcoming daily entries"
              backgroundColor="#f3faf5"
              borderColor="#cee7d4"
            >
              <PanchangaStats />
            </DashboardSection>
          )}
        </Box>

        {isSuperAdmin && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5, alignItems: "start" }}>
            <DashboardSection
              title="Events"
              subtitle="Current event lifecycle summary"
              backgroundColor="#fff8ef"
              borderColor="#f1dcc0"
            >
              <EventStats />
            </DashboardSection>
            <DashboardSection
              title="Notifications"
              subtitle="Publication status and recent messages"
              backgroundColor="#faf5ff"
              borderColor="#e2d2f3"
            >
              <NotificationStats />
              <RecentNotifications />
            </DashboardSection>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
