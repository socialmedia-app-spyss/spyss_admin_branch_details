import React from "react";
import {
  AccessTimeOutlined,
  CalendarMonthOutlined,
  CheckCircle,
  ErrorOutline,
  GroupOutlined,
  HistoryOutlined,
  HourglassEmpty,
  LanguageOutlined,
  NotificationsNoneOutlined,
  OpenInNew,
  SendOutlined,
  Sync,
  TouchAppOutlined,
  TranslateOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import type { ReactNode } from "react";
import type { AppNotification } from "../../types/notification";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TARGET_TYPES,
  NOTIFICATION_TYPES,
} from "../../types/notification";

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

const getSendStatusColor = (
  status?: string
): "default" | "info" | "warning" | "error" | "success" => {
  switch (status) {
    case "SENT":
      return "success";
    case "PENDING":
      return "warning";
    case "PROCESSING":
      return "info";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
};

const DetailItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) => (
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
      <Box sx={{ typography: "body2", fontWeight: 600, overflowWrap: "anywhere" }}>{value}</Box>
    </Box>
  </Stack>
);

export const NotificationShow = () => {
  const { query } = useShow<AppNotification>({ resource: "app_notifications" });
  const record = query.data?.data;

  if (query.isLoading) {
    return (
      <Show title="Notification Details">
        <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
          <CircularProgress size={32} />
        </Box>
      </Show>
    );
  }

  if (query.isError || !record) {
    return (
      <Show title="Notification Details">
        <Alert severity="error">Unable to load this notification.</Alert>
      </Show>
    );
  }

  const priorityMeta =
    NOTIFICATION_PRIORITIES.find((p) => p.value === record.priority) || NOTIFICATION_PRIORITIES[1];
  const typeMeta = NOTIFICATION_TYPES.find((t) => t.value === record.type);
  const targetMeta =
    NOTIFICATION_TARGET_TYPES.find((t) => t.value === record.target_type) ||
    NOTIFICATION_TARGET_TYPES[0];

  const titleObj = record.title || {};
  const bodyObj = record.body || {};
  const mainTitle = titleObj.en || titleObj.kn || record.notification_code;
  const kannadaTitle = titleObj.kn;

  return (
    <Show title={`Notification: ${mainTitle}`}>
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        {/* Hero Header Banner */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
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
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: 2,
                }}
              >
                <NotificationsNoneOutlined sx={{ fontSize: 32 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.875rem" },
                    fontWeight: 800,
                    overflowWrap: "anywhere",
                  }}
                >
                  {mainTitle}
                </Typography>
                {kannadaTitle && kannadaTitle !== mainTitle && (
                  <Typography
                    variant="h5"
                    component="p"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                      color: "text.secondary",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {kannadaTitle}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1.5}>
                  <Chip
                    size="small"
                    label={typeMeta?.label || record.type}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    label={`${record.priority} priority`}
                    color={priorityMeta.color}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    label={record.send_status}
                    color={getSendStatusColor(record.send_status)}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    label={record.is_active ? "Active" : "Inactive"}
                    color={record.is_active ? "success" : "default"}
                    variant="outlined"
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
                Notification Code
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                {record.notification_code}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Version {record.version}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Delivery Lifecycle Status Card */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3, p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <SendOutlined color="primary" />
            <Typography variant="h6" fontWeight={700}>
              FCM Broadcast & Delivery Lifecycle
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary">
                  Send Status:
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {record.send_status}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary">
                  Send Attempts:
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {record.send_attempts} attempt(s)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary">
                  Processing Started:
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {formatDateTime(record.processing_started_at, "Not started")}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary">
                  Broadcasted At:
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {formatDateTime(record.sent_at, "Pending dispatch")}
                </Typography>
              </Box>
            </Grid>

            {record.last_send_error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 1 }}>
                  <strong>Last Dispatch Error:</strong> {record.last_send_error}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Audience Targeting & Action Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <GroupOutlined color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Audience Targeting
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {targetMeta.description}
              </Typography>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Target Payload:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", mt: 0.5 }}>
                  {JSON.stringify(record.target_payload || {}, null, 2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <TouchAppOutlined color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Interactive Action Trigger
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Action Type: <strong>{record.action_type || "NONE (Display Only)"}</strong>
              </Typography>
              {record.action_payload && Object.keys(record.action_payload).length > 0 ? (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Action Payload:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", mt: 0.5 }}>
                    {JSON.stringify(record.action_payload, null, 2)}
                  </Typography>
                  {record.action_payload.url && (
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNew />}
                      component="a"
                      href={record.action_payload.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1, textTransform: "none" }}
                    >
                      Test Action URL
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No action payload configured.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Bilingual Message Panels */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5} color="primary.main">
                <LanguageOutlined fontSize="small" />
                <Typography variant="overline" fontWeight={700}>
                  ENGLISH MESSAGE
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} mb={1}>
                {displayValue(titleObj.en)}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}
              >
                {displayValue(bodyObj.en)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                mb={1.5}
                color="secondary.main"
              >
                <TranslateOutlined fontSize="small" />
                <Typography variant="overline" fontWeight={700}>
                  ಕನ್ನಡ ಸಂದೇಶ (KANNADA MESSAGE)
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} mb={1}>
                {displayValue(titleObj.kn)}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}
              >
                {displayValue(bodyObj.kn)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Banner Image Preview */}
        {record.image_url && (
          <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Notification Banner Image
            </Typography>
            <Box
              component="img"
              src={record.image_url}
              alt="Notification Banner"
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 360,
                borderRadius: 2,
                objectFit: "contain",
                mt: 1,
              }}
            />
          </Paper>
        )}

        {/* Timeline & Audit Card */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Schedule & Audit Trail
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                icon={<CalendarMonthOutlined fontSize="small" />}
                label="Dispatch Date & Time"
                value={formatDateTime(record.date_time)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                icon={<AccessTimeOutlined fontSize="small" />}
                label="Expiry Date & Time"
                value={formatDateTime(record.expiry_date, "No expiry")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                icon={<HistoryOutlined fontSize="small" />}
                label="Created At"
                value={formatDateTime(record.created_at)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                icon={<HistoryOutlined fontSize="small" />}
                label="Last Updated At"
                value={formatDateTime(record.updated_at)}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Show>
  );
};
