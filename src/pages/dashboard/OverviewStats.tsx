import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { Box, Card, CardActionArea, CardContent, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useGetIdentity, useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../types/event";
import type { Notification } from "../../types/notification";
import type { UserProfile } from "../../types/user";

type SummaryCardProps = {
  label: string;
  value: number;
  helper: string;
  color: string;
  icon: React.ReactNode;
  path: string;
  loading?: boolean;
};

const SummaryCard = ({ label, value, helper, color, icon, path, loading }: SummaryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        bgcolor: `${color}0A`,
        borderColor: `${color}2E`,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
      }}
    >
      <CardActionArea onClick={() => navigate(path)} sx={{ height: "100%" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" fontSize={14} fontWeight={600}>{label}</Typography>
              <Typography variant="h4" fontWeight={750} sx={{ mt: 0.5, color }}>
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              <Typography color="text.secondary" variant="caption">{helper}</Typography>
            </Box>
            <Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 2, color, bgcolor: `${color}14` }}>
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const OverviewStats = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const isSuperAdmin = identity?.role === "SUPER_ADMIN";
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];
  const branches = useList({
    resource: "latest_branches",
    filters: isValayaAdmin
      ? accessibleValayaIds.length
        ? [{ field: "valaya_id", operator: "in", value: accessibleValayaIds }]
        : [{ field: "valaya_id", operator: "eq", value: "__no_valaya_access__" }]
      : [],
    pagination: { mode: "off" },
  });
  const users = useList({ resource: "user_profiles", pagination: { mode: "off" } });
  const notifications = useList<Notification>({
    resource: "notifications",
    pagination: { mode: "off" },
    queryOptions: { enabled: isSuperAdmin },
  });
  const events = useList<Event>({
    resource: "events",
    pagination: { mode: "off" },
    queryOptions: { enabled: isSuperAdmin },
  });

  const now = Date.now();
  const activeNotifications = (notifications.result?.data ?? []).filter((item) =>
    item.is_active && (!item.expiry_date || new Date(item.expiry_date).getTime() >= now)
  ).length;
  const upcomingEvents = (events.result?.data ?? []).filter((item) =>
    item.is_active && item.start_datetime && new Date(item.start_datetime).getTime() > now
  ).length;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={isSuperAdmin ? 3 : 6}>
        <SummaryCard label="Total Branches" value={branches.result?.data.length ?? 0} helper="View branch directory" color="#1976d2" icon={<AccountTreeOutlinedIcon />} path="/branches" loading={branches.query.isLoading} />
      </Grid>
      <Grid item xs={12} sm={6} lg={isSuperAdmin ? 3 : 6}>
        <SummaryCard label="Total Users" value={users.result?.data.length ?? 0} helper="View registered users" color="#1976d2" icon={<PeopleAltOutlinedIcon />} path="/users" loading={users.query.isLoading} />
      </Grid>
      {isSuperAdmin && <>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard label="Active Notifications" value={activeNotifications} helper="Currently visible" color="#2e7d32" icon={<NotificationsActiveOutlinedIcon />} path="/notifications" loading={notifications.query.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard label="Upcoming Events" value={upcomingEvents} helper="Scheduled ahead" color="#ed6c02" icon={<EventAvailableOutlinedIcon />} path="/events" loading={events.query.isLoading} />
        </Grid>
      </>}
    </Grid>
  );
};
