import { Card, CardActionArea, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../types/notification";

export const NotificationStats = () => {
  const navigate = useNavigate();
  const { result, query } = useList<Notification>({
    resource: "notifications",
    pagination: { mode: "off" },
  });

  if (query.isLoading) return <CircularProgress size={24} />;
  if (query.isError) return <Typography color="error">Error loading notification stats.</Typography>;

  const notifications = result?.data ?? [];
  const now = Date.now();
  const isExpired = (notification: Notification) =>
    Boolean(notification.expiry_date && new Date(notification.expiry_date).getTime() < now);
  const total = notifications.length;
  const active = notifications.filter((notification) => notification.is_active && !isExpired(notification)).length;
  const expired = notifications.filter(isExpired).length;

  const cards = [
    { label: "Total Notifications", count: total, color: "primary.main" },
    { label: "Active Notifications", count: active, color: "success.main" },
    { label: "Expired Notifications", count: expired, color: "error.main" },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={4} key={card.label}>
          <Card>
            <CardActionArea onClick={() => navigate("/notifications")}>
              <CardContent>
                <Typography variant="h6">{card.label}</Typography>
                <Typography variant="h4" sx={{ color: card.color }}>{card.count}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
