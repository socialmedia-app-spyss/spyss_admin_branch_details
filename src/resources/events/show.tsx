import React, { useState } from "react";
import {
  CalendarMonthOutlined,
  Category as CategoryIcon,
  CollectionsOutlined,
  ContactPhoneOutlined,
  EventAvailableOutlined,
  HistoryOutlined,
  LocationOnOutlined,
  Map as MapIcon,
  NotificationsActive,
  OpenInNew,
  Phone,
  PublicOutlined,
  ScheduleOutlined,
  TranslateOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import type { ReactNode } from "react";
import type { AppEvent } from "../../types/event";
import { EVENT_CATEGORIES } from "../../types/event";
import { getEventStatus } from "./list";

const valueText = (input?: string | null, fallback = "Not provided") =>
  input?.trim() || fallback;

const formatDateTime = (input?: string | null, fallback = "Not scheduled") =>
  input
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(input))
    : fallback;

const InfoItem = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ color: "primary.main", display: "flex", mt: 0.25 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ typography: "body2", fontWeight: 600 }}>{children}</Box>
    </Box>
  </Stack>
);

export const EventShow = () => {
  const { query } = useShow<AppEvent>({ resource: "app_events" });
  const [langTab, setLangTab] = useState<"en" | "kn">("en");

  const record = query.data?.data;

  if (query.isLoading) {
    return (
      <Show title="Event Details">
        <Box minHeight={260} display="grid" sx={{ placeItems: "center" }}>
          <CircularProgress />
        </Box>
      </Show>
    );
  }

  if (query.isError || !record) {
    return (
      <Show title="Event Details">
        <Alert severity="error">Unable to load this event.</Alert>
      </Show>
    );
  }

  const status = getEventStatus(record);
  const cat =
    EVENT_CATEGORIES.find((c) => c.value === record.category) || EVENT_CATEGORIES[0];

  const titleObj = record.title || {};
  const shortDescObj = record.short_description || {};
  const fullDescObj = record.full_description || {};
  const locationObj = record.location_name || {};
  const addressObj = record.address || {};
  const contactPersonObj = record.contact_person || {};
  const imageUrlObj = record.image_url || {};

  const mainTitle = titleObj.en || titleObj.kn || record.event_code;
  const kannadaTitle = titleObj.kn;

  return (
    <Show title={`Event: ${mainTitle}`}>
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        {/* Hero Banner Header */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}14, ${theme.palette.background.paper} 70%)`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  flexShrink: 0,
                }}
              >
                <EventAvailableOutlined sx={{ fontSize: 32 }} />
              </Box>
              <Box>
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
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.5 }}>
                  <Chip size="small" label={status.label} color={status.color} sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={cat.label} color={cat.color} sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={record.event_code} variant="outlined" sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={`v${record.version}`} variant="outlined" />
                </Stack>
              </Box>
            </Stack>

            {record.registration_link && (
              <Button
                component="a"
                href={record.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                endIcon={<OpenInNew />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Registration Page
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Schedule, Location & Contacts Grid */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Event Schedule & Location Details
            </Typography>
          </Box>
          <Divider />
          <Box
            sx={{
              p: 2.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            <InfoItem icon={<CalendarMonthOutlined fontSize="small" />} label="Starts">
              {formatDateTime(record.start_datetime)}
            </InfoItem>

            <InfoItem icon={<ScheduleOutlined fontSize="small" />} label="Ends">
              {formatDateTime(record.end_datetime, "No end time")}
            </InfoItem>

            <InfoItem icon={<LocationOnOutlined fontSize="small" />} label="Venue & Location">
              <Stack spacing={0.5}>
                <span>{valueText(locationObj.en || locationObj.kn)}</span>
                {locationObj.kn && locationObj.kn !== locationObj.en && (
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>{locationObj.kn}</span>
                )}
                {record.map_url && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<MapIcon fontSize="small" />}
                    component="a"
                    href={record.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ p: 0, justifyContent: "flex-start", textTransform: "none", fontSize: "0.75rem" }}
                  >
                    View on Google Maps
                  </Button>
                )}
              </Stack>
            </InfoItem>

            <InfoItem icon={<ContactPhoneOutlined fontSize="small" />} label="Contact & Phone">
              <Stack spacing={0.5}>
                <span>{valueText(contactPersonObj.en || contactPersonObj.kn)}</span>
                {record.contact_phone && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<Phone fontSize="small" />}
                    component="a"
                    href={`tel:${record.contact_phone}`}
                    sx={{ p: 0, justifyContent: "flex-start", textTransform: "none", fontSize: "0.75rem" }}
                  >
                    {record.contact_phone}
                  </Button>
                )}
              </Stack>
            </InfoItem>
          </Box>
        </Paper>

        {/* Push Notification Delivery Tracking Card */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3, p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <NotificationsActive color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Push Notification Delivery
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    record.announcement_sent_at
                      ? theme.palette.mode === "dark"
                        ? "rgba(46, 125, 50, 0.12)"
                        : "#f1f8f3"
                      : theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.04)"
                        : "#f8f9fa",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ANNOUNCEMENT BROADCAST
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {record.announcement_sent_at ? (
                    `Broadcasted on ${formatDateTime(record.announcement_sent_at)}`
                  ) : record.send_announcement_push ? (
                    `Scheduled (Will broadcast when visible from ${formatDateTime(record.visible_from)})`
                  ) : (
                    "Push announcement disabled"
                  )}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    record.reminder_sent_at
                      ? theme.palette.mode === "dark"
                        ? "rgba(46, 125, 50, 0.12)"
                        : "#f1f8f3"
                      : theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.04)"
                        : "#f8f9fa",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  EVENT REMINDER BROADCAST
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                  {record.reminder_sent_at ? (
                    `Sent on ${formatDateTime(record.reminder_sent_at)}`
                  ) : (
                    "Scheduled prior to start date"
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bilingual Content Panels */}
        <Grid container spacing={3}>
          {/* English Panel */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden", height: "100%" }}>
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5} color="primary.main">
                  <TranslateOutlined fontSize="small" />
                  <Typography variant="overline" fontWeight={700}>
                    ENGLISH CONTENT
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} mb={1}>
                  {valueText(titleObj.en)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Short description
                </Typography>
                <Typography fontWeight={600} mb={2}>
                  {valueText(shortDescObj.en)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Full description
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.75 }}
                >
                  {valueText(fullDescObj.en)}
                </Typography>
                {addressObj.en && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Address:
                    </Typography>
                    <Typography variant="body2">{addressObj.en}</Typography>
                  </Box>
                )}
              </Box>
              {imageUrlObj.en && (
                <Box sx={{ px: 2.5, pb: 2.5, bgcolor: "action.hover" }}>
                  <Box
                    component="img"
                    src={imageUrlObj.en}
                    alt={`${valueText(titleObj.en)} English banner`}
                    sx={{
                      display: "block",
                      width: "100%",
                      maxHeight: 320,
                      borderRadius: 1.5,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Kannada Panel */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden", height: "100%" }}>
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5} color="secondary.main">
                  <TranslateOutlined fontSize="small" />
                  <Typography variant="overline" fontWeight={700}>
                    ಕನ್ನಡ ವಿವರಣೆ (KANNADA CONTENT)
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} mb={1}>
                  {valueText(titleObj.kn)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (Short description)
                </Typography>
                <Typography fontWeight={600} mb={2}>
                  {valueText(shortDescObj.kn)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  ಪೂರ್ಣ ವಿವರಣೆ (Full description)
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.75 }}
                >
                  {valueText(fullDescObj.kn)}
                </Typography>
                {addressObj.kn && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ವಿಳಾಸ (Address):
                    </Typography>
                    <Typography variant="body2">{addressObj.kn}</Typography>
                  </Box>
                )}
              </Box>
              {imageUrlObj.kn && (
                <Box sx={{ px: 2.5, pb: 2.5, bgcolor: "action.hover" }}>
                  <Box
                    component="img"
                    src={imageUrlObj.kn}
                    alt={`${valueText(titleObj.kn)} Kannada banner`}
                    sx={{
                      display: "block",
                      width: "100%",
                      maxHeight: 320,
                      borderRadius: 1.5,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Audit Trail Card */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, mt: 3, bgcolor: "action.hover" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HistoryOutlined fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              Event Audit Trail
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Created At:
              </Typography>
              <Typography variant="body2">{formatDateTime(record.created_at)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Last Updated At:
              </Typography>
              <Typography variant="body2">{formatDateTime(record.updated_at)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Show>
  );
};
