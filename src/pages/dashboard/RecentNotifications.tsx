import { Typography, List, ListItem, ListItemText, Box, Button, Chip, Divider } from "@mui/material";
import { useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../types/notification";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedName } from "../../utils/i18n";

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "Publish immediately";

export const RecentNotifications = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { query } = useList<Notification>({
    resource: "notifications",
    pagination: { pageSize: 3 },
    sorters: [{ field: "created_at", order: "desc" }],
  });
  const notifications = query.data?.data ?? [];

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>Recent notifications</Typography>
        <Button size="small" onClick={() => navigate("/notifications")}>View all</Button>
      </Box>
        {query.isLoading ? (
          <Typography color="text.secondary">Loading notifications...</Typography>
        ) : notifications.length > 0 ? (
          <List dense disablePadding>
            {notifications.map((notification) => (
              <ListItem key={notification.id} divider sx={{ cursor: "pointer" }} onClick={() => navigate(`/notifications/show/${notification.id}`)}
                secondaryAction={<Chip size="small" label={notification.priority} color={notification.priority === "URGENT" ? "error" : notification.priority === "HIGH" ? "warning" : "default"} />}>
                <ListItemText
                  primary={getLocalizedName(notification.title_en, notification.title_kn, language)}
                  secondary={`${notification.type} • ${formatDate(notification.date_time || notification.created_at)}`}
                  sx={{ pr: 10 }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No notifications found.</Typography>
        )}
    </Box>
  );
};
