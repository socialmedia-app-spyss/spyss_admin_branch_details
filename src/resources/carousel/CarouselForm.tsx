import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArticleOutlined,
  CalendarTodayOutlined,
  CategoryOutlined,
  CollectionsOutlined,
  DeviceHubOutlined,
  EventOutlined,
  LinkOutlined,
  OpenInNew,
  PhoneAndroidOutlined,
  PreviewOutlined,
  TranslateOutlined,
  YouTube,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { AppCarouselInput, CarouselActionType } from "../../types/carousel";

type Props = {
  register: UseFormRegister<AppCarouselInput>;
  control: Control<AppCarouselInput>;
  errors: FieldErrors<AppCarouselInput>;
  getValues: UseFormGetValues<AppCarouselInput>;
  setValue: UseFormSetValue<AppCarouselInput>;
  watch: UseFormWatch<AppCarouselInput>;
};

const ACTION_TYPES: { type: CarouselActionType; label: string; icon: React.ReactNode; placeholder: string; helper: string }[] = [
  {
    type: "NONE",
    label: "None (Display Only)",
    icon: <CategoryOutlined fontSize="small" />,
    placeholder: "No action parameter needed",
    helper: "Clicking the banner will not trigger any navigation.",
  },
  {
    type: "URL",
    label: "Web Link (URL)",
    icon: <LinkOutlined fontSize="small" />,
    placeholder: "https://example.com/announcement",
    helper: "Opens an external web page in browser.",
  },
  {
    type: "YOUTUBE",
    label: "YouTube Video",
    icon: <YouTube fontSize="small" sx={{ color: "#f44336" }} />,
    placeholder: "https://www.youtube.com/watch?v=xyz or video ID",
    helper: "Opens the YouTube video player.",
  },
  {
    type: "EVENT",
    label: "Event",
    icon: <EventOutlined fontSize="small" />,
    placeholder: "e.g., UUID or event-slug",
    helper: "Navigates directly to the specific event details.",
  },
  {
    type: "BRANCH",
    label: "Branch",
    icon: <DeviceHubOutlined fontSize="small" />,
    placeholder: "e.g., BR-001 or branch ID",
    helper: "Navigates to the branch details view.",
  },
  {
    type: "ARTICLE",
    label: "Article",
    icon: <ArticleOutlined fontSize="small" />,
    placeholder: "e.g., article slug or identifier",
    helper: "Navigates to a specific knowledge or news article.",
  },
  {
    type: "FESTIVAL",
    label: "Festival",
    icon: <CalendarTodayOutlined fontSize="small" />,
    placeholder: "e.g., festival code",
    helper: "Navigates to the festival page.",
  },
];

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const validateHttpsUrl = (value?: string | null) => {
  if (!value?.trim()) return true;
  if (!value.trim().startsWith("https://")) {
    return "Image URL must start with https:// (secured HTTPS protocol).";
  }
  if (value.trim().length > 1000) {
    return "URL must not exceed 1000 characters.";
  }
  try {
    new URL(value.trim());
    return true;
  } catch {
    return "Please enter a valid URL.";
  }
};

const sectionSx = { p: { xs: 2, sm: 2.5 }, borderRadius: 2.5 };
const shrinkLabel = { shrink: true };

export const CarouselForm = ({
  register,
  control,
  errors,
  getValues,
  setValue,
  watch,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"en" | "kn">("en");

  // Live watch values for live banner preview
  const watchedActionType = watch("action_type") || "NONE";
  const watchedActionValue = watch("action_value") || "";
  const watchedEnImage = watch("image_url_en") || "";
  const watchedEnTitle = watch("title_en") || "";
  const watchedEnSubtitle = watch("subtitle_en") || "";
  const watchedKnImage = watch("image_url_kn") || "";
  const watchedKnTitle = watch("title_kn") || "";
  const watchedKnSubtitle = watch("subtitle_kn") || "";
  const watchedIsActive = watch("is_active") ?? true;
  const watchedCarouselCode = watch("carousel_code") || "";

  const previewImage = activeTab === "kn"
    ? (watchedKnImage || watchedEnImage)
    : (watchedEnImage || watchedKnImage);

  const previewTitle = activeTab === "kn"
    ? (watchedKnTitle || watchedEnTitle || "ಬ್ಯಾನರ್ ಶೀರ್ಷಿಕೆ")
    : (watchedEnTitle || watchedKnTitle || "Carousel Banner Title");

  const previewSubtitle = activeTab === "kn"
    ? (watchedKnSubtitle || watchedEnSubtitle)
    : (watchedEnSubtitle || watchedKnSubtitle);

  const currentActionMeta = ACTION_TYPES.find((a) => a.type === watchedActionType) || ACTION_TYPES[0];

  const handleApplyPresetDays = (days: number) => {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    setValue("start_at", now.toISOString());
    setValue("end_at", end.toISOString(), { shouldValidate: true });
  };

  const handleClearSchedule = () => {
    setValue("start_at", null);
    setValue("end_at", null, { shouldValidate: true });
  };

  return (
    <Stack spacing={3}>
      {/* 1. Basic Information */}
      <Paper variant="outlined" sx={sectionSx}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <CollectionsOutlined color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Banner Identification & Status
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              {...register("carousel_code", {
                required: "Carousel code is required.",
                pattern: {
                  value: /^[A-Z0-9_-]+$/,
                  message: "Code must contain only uppercase letters, numbers, underscores, and hyphens (e.g., YOGA_DAY_2026).",
                },
              })}
              label="Carousel Code *"
              placeholder="e.g., YOGA_UTSAV_2026, BANNER_ANNUAL_DAY"
              fullWidth
              InputLabelProps={shrinkLabel}
              error={!!errors.carousel_code}
              helperText={
                errors.carousel_code?.message ||
                "Unique identifier used by client apps for tracking and analytics."
              }
              onChange={(e) => {
                const upper = e.target.value.toUpperCase();
                setValue("carousel_code", upper, { shouldValidate: true });
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!errors.default_locale}>
              <InputLabel id="default-locale-label" shrink>
                Default Locale *
              </InputLabel>
              <Controller
                name="default_locale"
                control={control}
                rules={{ required: "Default locale is required." }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || "en"}
                    labelId="default-locale-label"
                    label="Default Locale *"
                  >
                    <MenuItem value="en">English (en)</MenuItem>
                    <MenuItem value="kn">Kannada (kn)</MenuItem>
                    <MenuItem value="hi">Hindi (hi)</MenuItem>
                  </Select>
                )}
              />
              <FormHelperText>
                {errors.default_locale?.message || "Primary fallback language for app users"}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Active (Visible in App)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        When disabled, this banner is immediately hidden from the mobile application.
                      </Typography>
                    </Box>
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Action Trigger */}
      <Paper variant="outlined" sx={sectionSx}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          <OpenInNew color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Action on Banner Click
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose what occurs when a user taps or clicks on this banner inside the mobile app.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth error={!!errors.action_type}>
              <InputLabel id="carousel-action-type-label" shrink>
                Action Type *
              </InputLabel>
              <Controller
                name="action_type"
                control={control}
                rules={{ required: "Action type is required." }}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || "NONE"}
                    labelId="carousel-action-type-label"
                    label="Action Type *"
                  >
                    {ACTION_TYPES.map((action) => (
                      <MenuItem key={action.type} value={action.type}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {action.icon}
                          <span>{action.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>{errors.action_type?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={7}>
            <TextField
              {...register("action_value", {
                validate: (val) => {
                  const actionType = getValues("action_type");
                  if (actionType === "URL" && val) {
                    try {
                      new URL(val);
                    } catch {
                      return "Enter a valid URL (e.g. https://spyss.org).";
                    }
                  }
                  return true;
                },
              })}
              disabled={watchedActionType === "NONE"}
              label={
                watchedActionType === "NONE"
                  ? "Action Value (Disabled for None)"
                  : `${currentActionMeta.label} Parameter *`
              }
              placeholder={currentActionMeta.placeholder}
              fullWidth
              InputLabelProps={shrinkLabel}
              error={!!errors.action_value}
              helperText={errors.action_value?.message || currentActionMeta.helper}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Schedule & Timings */}
      <Paper variant="outlined" sx={sectionSx}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          <CalendarTodayOutlined color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Publication Schedule (Optional)
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Leave dates empty for banners that run indefinitely, or configure a start and end schedule.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="start_at"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={toDateTimeLocal(field.value)}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                  label="Display Start Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  helperText="Optional. Banner becomes visible from this date/time."
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="end_at"
              control={control}
              rules={{
                validate: (end) => {
                  const start = getValues("start_at");
                  if (end && start && new Date(end) <= new Date(start)) {
                    return "End time must be after start time.";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={toDateTimeLocal(field.value)}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                  label="Display End Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  error={!!errors.end_at}
                  helperText={errors.end_at?.message || "Optional. Banner automatically hides after this date/time."}
                />
              )}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          <Typography variant="caption" sx={{ alignSelf: "center", mr: 1, color: "text.secondary" }}>
            Quick Presets:
          </Typography>
          <Button size="small" variant="outlined" onClick={() => handleApplyPresetDays(7)}>
            7 Days
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleApplyPresetDays(15)}>
            15 Days
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleApplyPresetDays(30)}>
            30 Days
          </Button>
          <Button size="small" color="inherit" variant="text" onClick={handleClearSchedule}>
            Clear Dates
          </Button>
        </Stack>
      </Paper>

      {/* 4. Multilingual Image & Content + Live Preview */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={sectionSx}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <TranslateOutlined color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Multilingual Content & Images
              </Typography>
            </Stack>

            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}
            >
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>English (en)</span>
                    {watchedEnImage && <Chip size="small" label="Image Set" color="success" variant="outlined" />}
                  </Stack>
                }
                value="en"
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>ಕನ್ನಡ (kn)</span>
                    {watchedKnImage && <Chip size="small" label="Image Set" color="success" variant="outlined" />}
                  </Stack>
                }
                value="kn"
              />
            </Tabs>

            {/* English Form */}
            {activeTab === "en" && (
              <Stack spacing={2}>
                <TextField
                  {...register("image_url_en", {
                    required: "English image URL is required (database constraint).",
                    validate: validateHttpsUrl,
                  })}
                  label="English Banner Image URL (HTTPS) *"
                  placeholder="https://example.com/banner-en.webp"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  error={!!errors.image_url_en}
                  helperText={
                    errors.image_url_en?.message ||
                    "Must start with https://. Recommended size: 1600 × 900 or 1280 × 720 (16:9 / 2:1 WebP)."
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  {...register("title_en")}
                  label="Banner Title (English)"
                  placeholder="e.g., Annual Yoga Mahotsava 2026"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  helperText="Optional overlay title or heading"
                />

                <TextField
                  {...register("subtitle_en")}
                  label="Banner Subtitle / Tagline (English)"
                  placeholder="e.g., Join 100,000+ practitioners across Karnataka"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  helperText="Optional subtitle"
                />

                <TextField
                  {...register("description_en")}
                  label="Description / Caption (English)"
                  placeholder="Additional context or call to action..."
                  fullWidth
                  multiline
                  minRows={2}
                  InputLabelProps={shrinkLabel}
                  helperText="Optional descriptive text"
                />
              </Stack>
            )}

            {/* Kannada Form */}
            {activeTab === "kn" && (
              <Stack spacing={2}>
                <TextField
                  {...register("image_url_kn", {
                    validate: validateHttpsUrl,
                  })}
                  label="ಕನ್ನಡ ಬ್ಯಾನರ್ ಚಿತ್ರ ಲಿಂಕ್ (HTTPS)"
                  placeholder="https://example.com/banner-kn.webp"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  error={!!errors.image_url_kn}
                  helperText={
                    errors.image_url_kn?.message ||
                    "ಐಚ್ಛಿಕ. https:// ನಿಂದ ಪ್ರಾರಂಭವಾಗಬೇಕು. ಖಾಲಿಯಾಗಿದ್ದರೆ ಇಂಗ್ಲಿಷ್ ಚಿತ್ರವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ."
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  {...register("title_kn")}
                  label="ಬ್ಯಾನರ್ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)"
                  placeholder="ಉದಾ: ವಾರ್ಷಿಕ ಯೋಗ ಮಹೋತ್ಸವ ೨೦೨೬"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  helperText="ಐಚ್ಛಿಕ ಶೀರ್ಷಿಕೆ"
                />

                <TextField
                  {...register("subtitle_kn")}
                  label="ಉಪಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)"
                  placeholder="ಉದಾ: ರಾಜ್ಯಾದ್ಯಂತ ನಡೆಯುವ ಬೃಹತ್ ಯೋಗ ಶಿಬಿರ"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  helperText="ಐಚ್ಛಿಕ ಉಪಶೀರ್ಷಿಕೆ"
                />

                <TextField
                  {...register("description_kn")}
                  label="ವಿವರಣೆ (ಕನ್ನಡ)"
                  placeholder="ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ..."
                  fullWidth
                  multiline
                  minRows={2}
                  InputLabelProps={shrinkLabel}
                  helperText="ಐಚ್ಛಿಕ ವಿವರಣೆ"
                />
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Live Banner Preview Box */}
        <Grid item xs={12} lg={5}>
          <Paper
            variant="outlined"
            sx={{
              ...sectionSx,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "background.default" : "#fbfcfe",
              height: "100%",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PreviewOutlined color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Live Banner Preview
                </Typography>
              </Stack>
              <Chip
                size="small"
                icon={<PhoneAndroidOutlined fontSize="small" />}
                label={activeTab === "kn" ? "Kannada Preview" : "English Preview"}
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Real-time visualization of how the carousel slide renders in the app.
            </Typography>

            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                position: "relative",
                border: 1,
                borderColor: "divider",
              }}
            >
              {/* Badges on preview card */}
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 2,
                  display: "flex",
                  gap: 0.75,
                }}
              >
                <Chip
                  size="small"
                  label={watchedIsActive ? "Active" : "Inactive"}
                  color={watchedIsActive ? "success" : "default"}
                  sx={{ fontWeight: 600, backdropFilter: "blur(4px)", bgcolor: watchedIsActive ? "success.main" : "rgba(0,0,0,0.6)", color: "#fff" }}
                />
                {watchedActionType !== "NONE" && (
                  <Chip
                    size="small"
                    label={watchedActionType}
                    color="primary"
                    sx={{ fontWeight: 600, backdropFilter: "blur(4px)" }}
                  />
                )}
              </Box>

              {previewImage ? (
                <CardMedia
                  component="img"
                  height="220"
                  image={previewImage}
                  alt={previewTitle}
                  sx={{
                    bgcolor: "action.hover",
                    objectFit: "cover",
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    bgcolor: "action.hover",
                    display: "grid",
                    placeItems: "center",
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <CollectionsOutlined sx={{ fontSize: 48, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      Enter a valid HTTPS image URL on the left to see the banner preview
                    </Typography>
                  </Stack>
                </Box>
              )}

              <CardContent sx={{ p: 2, bgcolor: "background.paper" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={650}>
                  {watchedCarouselCode || "CAROUSEL_CODE"}
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: "anywhere", mt: 0.5 }}>
                  {previewTitle}
                </Typography>
                {previewSubtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {previewSubtitle}
                  </Typography>
                )}
                {watchedActionType !== "NONE" && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tapping banner triggers: <strong>{watchedActionType}</strong>
                    </Typography>
                    {watchedActionValue && (
                      <Typography variant="caption" sx={{ color: "primary.main", overflowWrap: "anywhere" }}>
                        {watchedActionValue}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
