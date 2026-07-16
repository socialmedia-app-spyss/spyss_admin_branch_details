import {
  AccessTimeOutlined,
  CalendarMonthOutlined,
  CheckCircleOutline,
  HistoryOutlined,
  InfoOutlined,
  LanguageOutlined,
  NotificationsNoneOutlined,
  ScheduleOutlined,
  TranslateOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import type { ReactNode } from "react";
import type { Notification } from "../../types/notification";

const displayValue = (input?: string | number | null) =>
  input === null || input === undefined || input === "" ? "Not provided" : input;

const formatDateTime = (input?: string | null, emptyValue = "Not provided") => {
  if (!input) return emptyValue;

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getNotificationStatus = (record?: Notification) => {
  if (!record?.is_active) return { label: "Inactive", color: "default" as const };

  const now = Date.now();
  const expiresAt = record.expiry_date ? new Date(record.expiry_date).getTime() : null;

  if (expiresAt && expiresAt <= now) return { label: "Expired", color: "error" as const };
  return { label: "Active", color: "success" as const };
};

const priorityColor = (priority?: Notification["priority"]) => {
  if (priority === "URGENT") return "error" as const;
  if (priority === "HIGH") return "warning" as const;
  if (priority === "LOW") return "info" as const;
  return "default" as const;
};

type MessagePanelProps = {
  icon: ReactNode;
  language: string;
  title?: string | null;
  body?: string | null;
};

const MessagePanel = ({ icon, language, title, body }: MessagePanelProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2.5,
      height: "100%",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" mb={1.75}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.5 }}
      >
        {language}
      </Typography>
    </Stack>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 650, mb: 1.25 }}>
      {displayValue(title)}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        lineHeight: 1.75,
      }}
    >
      {displayValue(body)}
    </Typography>
  </Paper>
);

type DetailItemProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        color: "primary.main",
        bgcolor: "action.hover",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export const NotificationShow = () => {
  const { query } = useShow<Notification>({ resource: "notifications" });
  const record = query.data?.data;
  const status = getNotificationStatus(record);

  if (query.isLoading) {
    return (
      <Show title="Notification Details">
        <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={32} />
            <Typography color="text.secondary">Loading notification…</Typography>
          </Stack>
        </Box>
      </Show>
    );
  }

  if (query.isError || !record) {
    return (
      <Show title="Notification Details">
        <Alert severity="error">Unable to load this notification. Please try refreshing the page.</Alert>
      </Show>
    );
  }

  return (
    <Show title="Notification Details">
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.background.paper} 55%)`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: 2,
                }}
              >
                <NotificationsNoneOutlined />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    fontWeight: 700,
                    lineHeight: 1.25,
                    overflowWrap: "anywhere",
                  }}
                >
                  {displayValue(record.title_en)}
                </Typography>
                {record.title_kn && (
                  <Typography
                    variant="h4"
                    component="p"
                    sx={{
                      mt: 0.75,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      fontWeight: 700,
                      lineHeight: 1.3,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {record.title_kn}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1.5}>
                  <Chip size="small" label={record.type} color="primary" variant="outlined" />
                  <Chip size="small" label={`${record.priority} priority`} color={priorityColor(record.priority)} />
                  <Chip
                    size="small"
                    icon={status.label === "Active" ? <CheckCircleOutline /> : <ScheduleOutlined />}
                    label={status.label}
                    color={status.color}
                    variant={status.color === "default" ? "outlined" : "filled"}
                  />
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Notification code
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                {displayValue(record.notification_code)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Version {displayValue(record.version)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2.5,
            mb: 3,
          }}
        >
          <MessagePanel
            icon={<LanguageOutlined fontSize="small" />}
            language="English message"
            title={record.title_en}
            body={record.body_en}
          />
          <MessagePanel
            icon={<TranslateOutlined fontSize="small" />}
            language="Kannada message"
            title={record.title_kn}
            body={record.body_kn}
          />
        </Box>

        <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <InfoOutlined color="primary" fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 650 }}>
                Schedule & activity
              </Typography>
            </Stack>
          </Box>
          <Divider />
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2.5, sm: 3 },
            }}
          >
            <DetailItem
              icon={<CalendarMonthOutlined fontSize="small" />}
              label="Event date & time"
              value={formatDateTime(record.date_time, "No event date set")}
            />
            <DetailItem
              icon={<AccessTimeOutlined fontSize="small" />}
              label="Expiry date"
              value={formatDateTime(record.expiry_date, "No expiry date")}
            />
            <DetailItem
              icon={<HistoryOutlined fontSize="small" />}
              label="Created"
              value={formatDateTime(record.created_at)}
            />
            <DetailItem
              icon={<ScheduleOutlined fontSize="small" />}
              label="Last updated"
              value={formatDateTime(record.updated_at)}
            />
          </Box>
        </Paper>
      </Box>
    </Show>
  );
};
