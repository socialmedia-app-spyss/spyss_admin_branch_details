import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AutoAwesome,
  CalendarMonth,
  Category as CategoryIcon,
  CollectionsOutlined,
  ContactPhone,
  Event as EventIcon,
  Link as LinkIcon,
  LocationOn,
  Map as MapIcon,
  NotificationsActive,
  OpenInNew,
  Phone,
  Schedule,
  Translate,
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
import type { AppEventInput, EventCategory } from "../../types/event";
import { EVENT_CATEGORIES } from "../../types/event";
import { generateEventCode } from "./normalizeEvent";

type EventFormProps = {
  register: UseFormRegister<AppEventInput>;
  control: Control<AppEventInput>;
  errors: FieldErrors<AppEventInput>;
  getValues: UseFormGetValues<AppEventInput>;
  setValue: UseFormSetValue<AppEventInput>;
  watch: UseFormWatch<AppEventInput>;
  isEdit?: boolean;
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const isValidOptionalUrl = (value?: string | null) => {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) || "Enter a valid http(s) URL.";
  } catch {
    return "Enter a valid http(s) URL.";
  }
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : null;

export const EventForm: React.FC<EventFormProps> = ({
  register,
  control,
  errors,
  getValues,
  setValue,
  watch,
  isEdit: _isEdit = false,
}) => {
  const [langTab, setLangTab] = useState<"en" | "kn">("en");

  const category = watch("category") || "GENERAL";
  const isActive = watch("is_active") ?? true;
  const sendAnnouncementPush = watch("send_announcement_push") ?? true;
  const imageUrlEn = watch("image_url_en") || "";
  const imageUrlKn = watch("image_url_kn") || "";
  const mapUrl = watch("map_url") || "";
  const registrationLink = watch("registration_link") || "";
  const announcementSentAt = watch("announcement_sent_at");
  const reminderSentAt = watch("reminder_sent_at");

  const handleAutoGenerateCode = () => {
    const title = getValues("title_en") || getValues("title_kn") || "";
    setValue("event_code", generateEventCode(title));
  };

  const selectedCategoryMeta =
    EVENT_CATEGORIES.find((c) => c.value === category) || EVENT_CATEGORIES[0];

  return (
    <Box sx={{ mt: 1 }}>
      <Stack spacing={3}>
        {/* Card 1: Core Details & Category */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<EventIcon color="primary" />}
            title="Core Event Identification & Category"
            subheader="Unique identifier code, category classification, and version number"
            action={
              <Chip
                label={selectedCategoryMeta.label}
                color={selectedCategoryMeta.color}
                icon={<CategoryIcon fontSize="small" />}
                sx={{ fontWeight: 700 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <TextField
                  {...register("event_code", {
                    required: "Event code is required.",
                    pattern: {
                      value: /^[A-Za-z0-9-_]+$/,
                      message: "Code must contain only letters, numbers, hyphens, and underscores.",
                    },
                  })}
                  label="Event Code *"
                  fullWidth
                  error={Boolean(errors.event_code)}
                  helperText={
                    errors.event_code?.message ||
                    "Unique identifier (e.g. EVT-2026-YOGA-DAY)"
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate code from title">
                          <IconButton size="small" onClick={handleAutoGenerateCode} color="primary">
                            <AutoAwesome fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth error={Boolean(errors.category)}>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    Category *
                  </Typography>
                  <Select
                    value={category}
                    onChange={(e) => setValue("category", e.target.value as EventCategory)}
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={cat.label} color={cat.color} sx={{ height: 20 }} />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                  {...register("version", {
                    required: "Version is required",
                    min: { value: 1, message: "Version must be >= 1" },
                    valueAsNumber: true,
                  })}
                  label="Version"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 1, step: 1 } }}
                  error={Boolean(errors.version)}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(isActive)}
                        onChange={(e) => setValue("is_active", e.target.checked)}
                        color="success"
                      />
                    }
                    label={isActive ? "Active" : "Inactive"}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 2: Push Notifications & Delivery Tracking */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<NotificationsActive color={sendAnnouncementPush ? "warning" : "action"} />}
            title="Push Notifications & Reminders"
            subheader="Automated broadcast notifications to mobile app users"
            action={
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(sendAnnouncementPush)}
                    onChange={(e) => setValue("send_announcement_push", e.target.checked)}
                    color="warning"
                  />
                }
                label={sendAnnouncementPush ? "Push Announcement Enabled" : "Push Disabled"}
                sx={{ m: 0 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      announcementSentAt
                        ? theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.12)"
                          : "#f1f8f3"
                        : theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.04)"
                          : "#f8f9fa",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ANNOUNCEMENT PUSH STATUS
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                    {announcementSentAt ? (
                      `Sent on ${formatDateTime(announcementSentAt)}`
                    ) : sendAnnouncementPush ? (
                      "Pending (Will broadcast when visible_from timestamp arrives)"
                    ) : (
                      "Disabled"
                    )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      reminderSentAt
                        ? theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.12)"
                          : "#f1f8f3"
                        : theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.04)"
                          : "#f8f9fa",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    EVENT REMINDER PUSH STATUS
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5 }}>
                    {reminderSentAt ? (
                      `Sent on ${formatDateTime(reminderSentAt)}`
                    ) : (
                      "Pending (Will broadcast prior to start_datetime)"
                    )}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 3: Bilingual Localized Content (English & Kannada) */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<Translate color="primary" />}
            title="Localized Content"
            subheader="Provide event information in English and Kannada"
            action={
              <Tabs
                value={langTab}
                onChange={(_, val) => setLangTab(val)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 36 }}
              >
                <Tab
                  value="en"
                  label="English"
                  sx={{ textTransform: "none", fontWeight: 700, minHeight: 36, py: 0.5 }}
                />
                <Tab
                  value="kn"
                  label="ಕನ್ನಡ (Kannada)"
                  sx={{ textTransform: "none", fontWeight: 700, minHeight: 36, py: 0.5 }}
                />
              </Tabs>
            }
          />
          <Divider />
          <CardContent>
            {/* English Tab */}
            <Box sx={{ display: langTab === "en" ? "block" : "none" }}>
              <Stack spacing={2.5}>
                <TextField
                  {...register("title_en", {
                    validate: (val) => {
                      const knTitle = getValues("title_kn");
                      if (!val?.trim() && !knTitle?.trim()) {
                        return "Event title in either English or Kannada is required.";
                      }
                      return true;
                    },
                  })}
                  label="Event Title (English) *"
                  fullWidth
                  error={Boolean(errors.title_en)}
                  helperText={errors.title_en?.message}
                  placeholder="e.g. State Level Yoga Shibira 2026"
                />

                <TextField
                  {...register("short_description_en")}
                  label="Short Description (English)"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Brief summary displayed on event cards in mobile app"
                />

                <TextField
                  {...register("full_description_en")}
                  label="Full Description (English)"
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Comprehensive event details, guidelines, schedule breakdown, and prerequisites"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...register("location_name_en")}
                      label="Location / Venue Name (English)"
                      fullWidth
                      placeholder="e.g. SPYSS Kendriya Karyalaya"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      {...register("contact_person_en")}
                      label="Contact Person Name (English)"
                      fullWidth
                      placeholder="e.g. Shri Ramesh Kumar"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register("address_en")}
                      label="Full Address (English)"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g. #12, 5th Main, Malleshwaram, Bengaluru - 560003"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register("image_url_en", { validate: isValidOptionalUrl })}
                      label="Banner Image URL (English)"
                      fullWidth
                      error={Boolean(errors.image_url_en)}
                      helperText={
                        errors.image_url_en?.message ||
                        "Recommended resolution: 1280 × 720 (16:9) WebP / JPG"
                      }
                      placeholder="https://..."
                    />
                    {imageUrlEn && (
                      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={imageUrlEn}
                          sx={{ width: 120, height: 68, borderRadius: 1.5 }}
                        >
                          <CollectionsOutlined />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          English Banner Preview
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {/* Kannada Tab */}
            <Box sx={{ display: langTab === "kn" ? "block" : "none" }}>
              <Stack spacing={2.5}>
                <TextField
                  {...register("title_kn", {
                    validate: (val) => {
                      const enTitle = getValues("title_en");
                      if (!val?.trim() && !enTitle?.trim()) {
                        return "Event title in either English or Kannada is required.";
                      }
                      return true;
                    },
                  })}
                  label="ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ) *"
                  fullWidth
                  error={Boolean(errors.title_kn)}
                  helperText={errors.title_kn?.message}
                  placeholder="ಉದಾ: ರಾಜ್ಯ ಮಟ್ಟದ ಯೋಗ ಶಿಬಿರ ೨೦೨೬"
                />

                <TextField
                  {...register("short_description_kn")}
                  label="ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (ಕನ್ನಡ)"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="ಮೊಬೈಲ್ ಆಪ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುವ ಕಿರು ವಿವರಣೆ"
                />

                <TextField
                  {...register("full_description_kn")}
                  label="ಪೂರ್ಣ ವಿವರಣೆ (ಕನ್ನಡ)"
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="ಕಾರ್ಯಕ್ರಮದ ಸಮಗ್ರ ಮಾಹಿತಿ, ನಿಯಮಗಳು ಮತ್ತು ವಿವರಗಳು"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...register("location_name_kn")}
                      label="ಸ್ಥಳದ ಹೆಸರು (ಕನ್ನಡ)"
                      fullWidth
                      placeholder="ಉದಾ: ಎಸ್.ಪಿ.ವೈ.ಎಸ್.ಎಸ್ ಕೇಂದ್ರ ಕಾರ್ಯಾಲಯ"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      {...register("contact_person_kn")}
                      label="ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ ಹೆಸರು (ಕನ್ನಡ)"
                      fullWidth
                      placeholder="ಉದಾ: ಶ್ರೀ ರಮೇಶ್ ಕುಮಾರ್"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register("address_kn")}
                      label="ವಿಳಾಸ (ಕನ್ನಡ)"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="ಉದಾ: #೧೨, ೫ನೇ ಮುಖ್ಯ ರಸ್ತೆ, ಮಲ್ಲೇಶ್ವರಂ, ಬೆಂಗಳೂರು - ೫೬೦೦೦೩"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register("image_url_kn", { validate: isValidOptionalUrl })}
                      label="ಕನ್ನಡ ಬ್ಯಾನರ್ ಚಿತ್ರದ ಲಿಂಕ್ (URL)"
                      fullWidth
                      error={Boolean(errors.image_url_kn)}
                      helperText={
                        errors.image_url_kn?.message ||
                        "ಶಿಫಾರಸು ಮಾಡಿದ ಅಳತೆ: 1280 × 720 (16:9) WebP / JPG"
                      }
                      placeholder="https://..."
                    />
                    {imageUrlKn && (
                      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={imageUrlKn}
                          sx={{ width: 120, height: 68, borderRadius: 1.5 }}
                        >
                          <CollectionsOutlined />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          ಕನ್ನಡ ಬ್ಯಾನರ್ ಮುನ್ನೋಟ (Kannada Preview)
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Card 4: Schedule, Timezone & Visibility */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<CalendarMonth color="primary" />}
            title="Schedule, Timezone & Visibility"
            subheader="Event start, end, publishing date, and timezone configuration"
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="start_datetime"
                  control={control}
                  rules={{ required: "Start date and time is required." }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={toDateTimeLocal(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Event Start Date & Time *"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.start_datetime)}
                      helperText={errors.start_datetime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="end_datetime"
                  control={control}
                  rules={{
                    required: "End date and time is required.",
                    validate: (end) => {
                      const start = getValues("start_datetime");
                      if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
                        return "End datetime cannot be before start datetime.";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={toDateTimeLocal(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Event End Date & Time *"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.end_datetime)}
                      helperText={errors.end_datetime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="visible_from"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={toDateTimeLocal(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Visible in App From"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      helperText="Date from which the event appears in the mobile app list"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  {...register("event_timezone")}
                  label="Event Timezone"
                  fullWidth
                  defaultValue="Asia/Kolkata"
                  helperText="Default: Asia/Kolkata (IST)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 5: Contact & Online Links */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<ContactPhone color="primary" />}
            title="Contact & Online Links"
            subheader="Phone numbers, Google Maps location, and registration URLs"
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  {...register("contact_phone")}
                  label="Contact Phone Number"
                  fullWidth
                  placeholder="+91 98765 43210"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...register("map_url", { validate: isValidOptionalUrl })}
                  label="Google Maps Location URL"
                  fullWidth
                  error={Boolean(errors.map_url)}
                  helperText={errors.map_url?.message || "Direct Google Maps pin / directions link"}
                  placeholder="https://maps.google.com/..."
                  InputProps={{
                    endAdornment: mapUrl ? (
                      <InputAdornment position="end">
                        <Tooltip title="Test Google Map Link">
                          <IconButton
                            size="small"
                            component="a"
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...register("registration_link", { validate: isValidOptionalUrl })}
                  label="Registration / RSVP URL"
                  fullWidth
                  error={Boolean(errors.registration_link)}
                  helperText={errors.registration_link?.message || "Online registration page link"}
                  placeholder="https://..."
                  InputProps={{
                    endAdornment: registrationLink ? (
                      <InputAdornment position="end">
                        <Tooltip title="Test Registration Link">
                          <IconButton
                            size="small"
                            component="a"
                            href={registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
