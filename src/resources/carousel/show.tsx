import { useState, type ReactNode } from "react";
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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  CollectionsOutlined,
  HistoryOutlined,
  LanguageOutlined,
  LinkOutlined,
  OpenInNew,
  PhoneAndroidOutlined,
  ScheduleOutlined,
  TranslateOutlined,
  YouTube,
} from "@mui/icons-material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import type { AppCarousel } from "../../types/carousel";
import { getCarouselScheduleStatus } from "./normalizeCarousel";

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

export const CarouselShow = () => {
  const { query } = useShow<AppCarousel>({ resource: "app_carousel" });
  const record = query.data?.data;
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  if (query.isLoading) {
    return (
      <Show title="Carousel Details">
        <Box minHeight={260} display="grid" sx={{ placeItems: "center" }}>
          <CircularProgress />
        </Box>
      </Show>
    );
  }

  if (query.isError || !record) {
    return (
      <Show title="Carousel Details">
        <Alert severity="error">Unable to load this carousel banner.</Alert>
      </Show>
    );
  }

  const schedule = getCarouselScheduleStatus(record);
  const translations = record.translations || {};
  const currentTranslation = translations[selectedLanguage] || translations[record.default_locale] || translations.en;
  const bannerImage = currentTranslation?.image_url;

  return (
    <Show title="Carousel Banner Details">
      <Box sx={{ maxWidth: 1280, mx: "auto", pb: 4 }}>
        {/* Header Hero Banner */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(0,0,0,0.4))"
                : "linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(255, 255, 255, 0.9) 70%)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
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
                <CollectionsOutlined sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  CAROUSEL BANNER
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    letterSpacing: 0.5,
                  }}
                >
                  {record.carousel_code}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.75} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    label={schedule.label}
                    color={schedule.color}
                    variant={schedule.status === "ALWAYS_ACTIVE" ? "outlined" : "filled"}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    label={`Action: ${record.action_type}`}
                    color={record.action_type === "NONE" ? "default" : "primary"}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<LanguageOutlined fontSize="small" />}
                    label={`Default: ${record.default_locale?.toUpperCase()}`}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>

            {record.action_type === "URL" && record.action_value && (
              <Button
                component="a"
                href={record.action_value}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                endIcon={<OpenInNew />}
              >
                Visit Action Link
              </Button>
            )}

            {record.action_type === "YOUTUBE" && record.action_value && (
              <Button
                component="a"
                href={
                  record.action_value.startsWith("http")
                    ? record.action_value
                    : `https://www.youtube.com/watch?v=${record.action_value}`
                }
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="error"
                startIcon={<YouTube />}
                endIcon={<OpenInNew />}
              >
                Watch Video
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Live Banner Visual Display */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            mb: 3,
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneAndroidOutlined color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Live Banner Visualizer
              </Typography>
            </Stack>

            {/* Language Switcher for Preview */}
            <Tabs
              value={selectedLanguage}
              onChange={(_, val) => setSelectedLanguage(val)}
              sx={{ minHeight: 36 }}
            >
              <Tab
                label="English (en)"
                value="en"
                sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }}
              />
              <Tab
                label="ಕನ್ನಡ (kn)"
                value="kn"
                sx={{ minHeight: 36, py: 0.5, fontWeight: 600 }}
              />
            </Tabs>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          {bannerImage ? (
            <Box
              sx={{
                position: "relative",
                borderRadius: 2.5,
                overflow: "hidden",
                bgcolor: "action.hover",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                component="img"
                src={bannerImage}
                alt={currentTranslation?.title || record.carousel_code}
                sx={{
                  width: "100%",
                  maxHeight: 480,
                  objectFit: "contain",
                  display: "block",
                  mx: "auto",
                }}
              />
              {(currentTranslation?.title || currentTranslation?.subtitle) && (
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {currentTranslation?.title && (
                    <Typography variant="h6" fontWeight={700}>
                      {currentTranslation.title}
                    </Typography>
                  )}
                  {currentTranslation?.subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {currentTranslation.subtitle}
                    </Typography>
                  )}
                  {currentTranslation?.description && (
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                      {currentTranslation.description}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                p: 6,
                textAlign: "center",
                bgcolor: "action.hover",
                borderRadius: 2.5,
              }}
            >
              <CollectionsOutlined sx={{ fontSize: 50, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">
                No image found for locale &quot;{selectedLanguage}&quot;.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Schedule & Action Metadata Grid */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Schedule & Action Configuration
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
            <InfoItem
              icon={<CalendarMonthOutlined fontSize="small" />}
              label="Display Start"
            >
              {formatDateTime(record.start_at, "Immediately (No start limit)")}
            </InfoItem>

            <InfoItem
              icon={<ScheduleOutlined fontSize="small" />}
              label="Display End"
            >
              {formatDateTime(record.end_at, "Never expires (Indefinite)")}
            </InfoItem>

            <InfoItem
              icon={<LinkOutlined fontSize="small" />}
              label="Action Parameter"
            >
              {record.action_value ? (
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ wordBreak: "break-all" }}
                >
                  {record.action_value}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None
                </Typography>
              )}
            </InfoItem>

            <InfoItem
              icon={<HistoryOutlined fontSize="small" />}
              label="Last Updated"
            >
              {formatDateTime(record.updated_at)}
            </InfoItem>
          </Box>
        </Paper>

        {/* Multilingual Translation Details */}
        <Grid container spacing={3}>
          {/* English Panel */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <TranslateOutlined color="primary" fontSize="small" />
                <Typography variant="overline" fontWeight={700} color="primary.main">
                  English (en) Content
                </Typography>
                {record.default_locale === "en" && (
                  <Chip size="small" label="Default" color="primary" variant="outlined" />
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {translations.en?.title || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subtitle / Tagline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translations.en?.subtitle || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {translations.en?.description || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Image URL
                  </Typography>
                  {translations.en?.image_url ? (
                    <Typography
                      variant="body2"
                      component="a"
                      href={translations.en.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "primary.main", wordBreak: "break-all", display: "block" }}
                    >
                      {translations.en.image_url}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">—</Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Kannada Panel */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <TranslateOutlined color="primary" fontSize="small" />
                <Typography variant="overline" fontWeight={700} color="primary.main">
                  ಕನ್ನಡ (kn) Content
                </Typography>
                {record.default_locale === "kn" && (
                  <Chip size="small" label="Default" color="primary" variant="outlined" />
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ಶೀರ್ಷಿಕೆ (Title)
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {translations.kn?.title || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ಉಪಶೀರ್ಷಿಕೆ (Subtitle)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translations.kn?.subtitle || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ವಿವರಣೆ (Description)
                  </Typography>
                  <Typography variant="body2">
                    {translations.kn?.description || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ಚಿತ್ರ ಲಿಂಕ್ (Image URL)
                  </Typography>
                  {translations.kn?.image_url ? (
                    <Typography
                      variant="body2"
                      component="a"
                      href={translations.kn.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "primary.main", wordBreak: "break-all", display: "block" }}
                    >
                      {translations.kn.image_url}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      (ಇಂಗ್ಲಿಷ್ ಚಿತ್ರವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ)
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Show>
  );
};
