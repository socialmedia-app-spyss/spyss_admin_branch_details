import {
  CalendarMonthOutlined,
  EventAvailableOutlined,
  HistoryOutlined,
  LocationOnOutlined,
  OpenInNew,
  ScheduleOutlined,
  TranslateOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
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
import type { Event } from "../../types/event";
import { getEventStatus } from "./list";

const value = (input?: string | null, fallback = "Not provided") => input?.trim() || fallback;
const formatDateTime = (input?: string | null, fallback = "Not scheduled") => input
  ? new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(input))
  : fallback;

const InfoItem = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ color: "primary.main", display: "flex", mt: 0.25 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ typography: "body2", fontWeight: 600 }}>{children}</Box>
    </Box>
  </Stack>
);

const LanguagePanel = ({
  title,
  shortDescription,
  fullDescription,
  imageUrl,
  language,
}: {
  title?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  imageUrl?: string | null;
  language: string;
}) => (
  <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden", height: "100%" }}>
    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1.5} color="primary.main">
        <TranslateOutlined fontSize="small" />
        <Typography variant="overline" fontWeight={700}>{language}</Typography>
      </Stack>
      <Typography variant="h5" fontWeight={700} mb={1}>{value(title)}</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        Short description
      </Typography>
      <Typography fontWeight={600} mb={2}>{value(shortDescription)}</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        Full description
      </Typography>
      <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.75 }}>
        {value(fullDescription)}
      </Typography>
    </Box>
    {imageUrl && (
      <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 }, bgcolor: "action.hover" }}>
        <Box
          component="img"
          src={imageUrl}
          alt={`${value(title, "Event")} ${language} image`}
          sx={{
            display: "block",
            width: "auto",
            maxWidth: "100%",
            height: "auto",
            maxHeight: 520,
            mx: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
    )}
  </Paper>
);

export const EventShow = () => {
  const { query } = useShow<Event>({ resource: "events" });
  const record = query.data?.data;

  if (query.isLoading) {
    return <Show title="Event Details"><Box minHeight={260} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box></Show>;
  }

  if (query.isError || !record) {
    return <Show title="Event Details"><Alert severity="error">Unable to load this event.</Alert></Show>;
  }

  const status = getEventStatus(record);

  return (
    <Show title="Event Details">
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.paper} 60%)`,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ width: 52, height: 52, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", flexShrink: 0 }}>
                <EventAvailableOutlined />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" }, fontWeight: 700, overflowWrap: "anywhere" }}
                >
                  {record.event_name_en}
                </Typography>
                {record.event_name_kn && (
                  <Typography
                    variant="h4"
                    component="p"
                    sx={{ mt: 0.75, fontSize: { xs: "1.75rem", sm: "2.125rem" }, fontWeight: 700, overflowWrap: "anywhere" }}
                  >
                    {record.event_name_kn}
                  </Typography>
                )}
                <Chip sx={{ mt: 1.5 }} size="small" label={status.label} color={status.color} variant={status.color === "default" ? "outlined" : "filled"} />
              </Box>
            </Stack>
            {record.registration_link && (
              <Button component="a" href={record.registration_link} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<OpenInNew />}>
                Registration link
              </Button>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, py: 2 }}><Typography variant="h6" fontWeight={700}>Event information</Typography></Box>
          <Divider />
          <Box sx={{ p: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 3 }}>
            <InfoItem icon={<CalendarMonthOutlined fontSize="small" />} label="Starts">{formatDateTime(record.start_datetime)}</InfoItem>
            <InfoItem icon={<ScheduleOutlined fontSize="small" />} label="Ends">{formatDateTime(record.end_datetime, "No end time")}</InfoItem>
            <InfoItem icon={<LocationOnOutlined fontSize="small" />} label="Location">
              <Stack spacing={0.5}>
                <span>{record.location_en}</span>
                {record.location_kn && <span>{record.location_kn}</span>}
              </Stack>
            </InfoItem>
            <InfoItem icon={<HistoryOutlined fontSize="small" />} label="Last updated">{formatDateTime(record.updated_at)}</InfoItem>
          </Box>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
          <LanguagePanel
            language="English"
            title={record.event_name_en}
            shortDescription={record.short_description_en}
            fullDescription={record.full_description_en}
            imageUrl={record.image_url_en}
          />
          <LanguagePanel
            language="Kannada"
            title={record.event_name_kn}
            shortDescription={record.short_description_kn}
            fullDescription={record.full_description_kn}
            imageUrl={record.image_url_kn}
          />
        </Box>
      </Box>
    </Show>
  );
};
