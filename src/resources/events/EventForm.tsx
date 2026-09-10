import React from "react";
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
  Language,
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
import {
  generateEventCode,
  validateEnglishEventText,
  validateKannadaEventText,
} from "./normalizeEvent";
import { sanitizeImageUrl, validateImageUrl } from "../../utils/imageUrl";

type EventFormProps = {
  register: UseFormRegister<AppEventInput>;
  control: Control<AppEventInput>;
  errors: FieldErrors<AppEventInput>;
  getValues: UseFormGetValues<AppEventInput>;
  setValue: UseFormSetValue<AppEventInput>;
  watch: UseFormWatch<AppEventInput>;
  isEdit?: boolean;
};

const shrinkLabel = { shrink: true };

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
                  InputLabelProps={shrinkLabel}
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
                  InputLabelProps={shrinkLabel}
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
            title="Event Content & Localized Details"
            subheader="Provide event information in English and Kannada (Title in at least one language is required)"
            action={
              <Chip
                label="English & Kannada (Bilingual)"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {/* English Column */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={2}
                    color="primary.main"
                  >
                    <Language fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      English Event Details
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <TextField
                      {...register("title_en", {
                        validate: (val) => {
                          const knTitle = getValues("title_kn");
                          if (!val?.trim() && !knTitle?.trim()) {
                            return "Event title in either English or Kannada is required.";
                          }
                          if (val?.trim()) {
                            const langErr = validateEnglishEventText(val, "English Title");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="Event Title (English) *"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.title_en)}
                      helperText={
                        errors.title_en?.message ||
                        "Event name shown on banners and mobile list"
                      }
                      placeholder="e.g. State Level Yoga Shibira 2026"
                    />

                    <TextField
                      {...register("short_description_en", {
                        validate: (val) => {
                          if (val?.trim()) {
                            const langErr = validateEnglishEventText(val, "English Short Description");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="Short Description (English)"
                      fullWidth
                      multiline
                      rows={2}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.short_description_en)}
                      helperText={
                        errors.short_description_en?.message ||
                        "Brief summary displayed on event cards in mobile app"
                      }
                      placeholder="Brief summary displayed on event cards in mobile app"
                    />

                    <TextField
                      {...register("full_description_en", {
                        validate: (val) => {
                          if (val?.trim()) {
                            const langErr = validateEnglishEventText(val, "English Full Description");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="Full Description (English)"
                      fullWidth
                      multiline
                      rows={5}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.full_description_en)}
                      helperText={
                        errors.full_description_en?.message ||
                        "Comprehensive event details, guidelines, and schedule"
                      }
                      placeholder="Comprehensive event details, guidelines, schedule breakdown, and prerequisites"
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register("location_name_en", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateEnglishEventText(val, "English Location Name");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="Location / Venue Name (English)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.location_name_en)}
                          helperText={errors.location_name_en?.message}
                          placeholder="e.g. SPYSS Kendriya Karyalaya"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register("contact_person_en", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateEnglishEventText(val, "English Contact Person");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="Contact Person Name (English)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.contact_person_en)}
                          helperText={errors.contact_person_en?.message}
                          placeholder="e.g. Shri Ramesh Kumar"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          {...register("address_en", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateEnglishEventText(val, "English Address");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="Full Address (English)"
                          fullWidth
                          multiline
                          rows={2}
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.address_en)}
                          helperText={errors.address_en?.message}
                          placeholder="e.g. #12, 5th Main, Malleshwaram, Bengaluru - 560003"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          {...register("image_url_en", {
                            validate: (val) =>
                              validateImageUrl(val, { required: false, fieldLabel: "English image URL" }),
                            onBlur: (e) => {
                              const cleaned = sanitizeImageUrl(e.target.value);
                              if (cleaned && cleaned !== e.target.value) {
                                setValue("image_url_en", cleaned, { shouldValidate: true });
                              }
                            },
                          })}
                          label="Banner Image URL (English)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.image_url_en)}
                          helperText={
                            errors.image_url_en?.message ||
                            "Recommended resolution: 1280 × 720 (16:9) WebP / JPG / PNG (SVG unsupported)"
                          }
                          placeholder="https://..."
                        />
                        {imageUrlEn && (
                          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              variant="rounded"
                              src={sanitizeImageUrl(imageUrlEn) || imageUrlEn}
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
              </Grid>

              {/* Kannada Column */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={2}
                    color="secondary.main"
                  >
                    <Translate fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700} color="secondary.main">
                      ಕನ್ನಡ ವಿವರಗಳು (Kannada Details)
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <TextField
                      {...register("title_kn", {
                        validate: (val) => {
                          const enTitle = getValues("title_en");
                          if (!val?.trim() && !enTitle?.trim()) {
                            return "Event title in either English or Kannada is required.";
                          }
                          if (val?.trim()) {
                            const langErr = validateKannadaEventText(val, "ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ) *"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.title_kn)}
                      helperText={
                        errors.title_kn?.message ||
                        "ಮೊಬೈಲ್ ಆಪ್ ಮತ್ತು ಬ್ಯಾನರ್‌ನಲ್ಲಿ ತೋರಿಸುವ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ ಮತ್ತು ಅಂಕಿಗಳು)"
                      }
                      placeholder="ಉದಾ: ರಾಜ್ಯ ಮಟ್ಟದ ಯೋಗ ಶಿಬಿರ 2026"
                    />

                    <TextField
                      {...register("short_description_kn", {
                        validate: (val) => {
                          if (val?.trim()) {
                            const langErr = validateKannadaEventText(val, "ಕನ್ನಡ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (ಕನ್ನಡ)"
                      fullWidth
                      multiline
                      rows={2}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.short_description_kn)}
                      helperText={
                        errors.short_description_kn?.message ||
                        "ಮೊಬೈಲ್ ಆಪ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುವ ಕಿರು ವಿವರಣೆ"
                      }
                      placeholder="ಮೊಬೈಲ್ ಆಪ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುವ ಕಿರು ವಿವರಣೆ"
                    />

                    <TextField
                      {...register("full_description_kn", {
                        validate: (val) => {
                          if (val?.trim()) {
                            const langErr = validateKannadaEventText(val, "ಕನ್ನಡ ಪೂರ್ಣ ವಿವರಣೆ");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="ಪೂರ್ಣ ವಿವರಣೆ (ಕನ್ನಡ)"
                      fullWidth
                      multiline
                      rows={5}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.full_description_kn)}
                      helperText={
                        errors.full_description_kn?.message ||
                        "ಕಾರ್ಯಕ್ರಮದ ಸಮಗ್ರ ಮಾಹಿತಿ, ನಿಯಮಗಳು ಮತ್ತು ವಿವರಗಳು"
                      }
                      placeholder="ಕಾರ್ಯಕ್ರಮದ ಸಮಗ್ರ ಮಾಹಿತಿ, ನಿಯಮಗಳು ಮತ್ತು ವಿವರಗಳು"
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register("location_name_kn", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateKannadaEventText(val, "ಸ್ಥಳದ ಹೆಸರು");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="ಸ್ಥಳದ ಹೆಸರು (ಕನ್ನಡ)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.location_name_kn)}
                          helperText={errors.location_name_kn?.message}
                          placeholder="ಉದಾ: ಎಸ್.ಪಿ.ವೈ.ಎಸ್.ಎಸ್ ಕೇಂದ್ರ ಕಾರ್ಯಾಲಯ"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register("contact_person_kn", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateKannadaEventText(val, "ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ ಹೆಸರು");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ ಹೆಸರು (ಕನ್ನಡ)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.contact_person_kn)}
                          helperText={errors.contact_person_kn?.message}
                          placeholder="ಉದಾ: ಶ್ರೀ ರಮೇಶ್ ಕುಮಾರ್"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          {...register("address_kn", {
                            validate: (val) => {
                              if (val?.trim()) {
                                const langErr = validateKannadaEventText(val, "ವಿಳಾಸ");
                                if (langErr !== true) return langErr;
                              }
                              return true;
                            },
                          })}
                          label="ವಿಳಾಸ (ಕನ್ನಡ)"
                          fullWidth
                          multiline
                          rows={2}
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.address_kn)}
                          helperText={errors.address_kn?.message}
                          placeholder="ಉದಾ: #12, 5ನೇ ಮುಖ್ಯ ರಸ್ತೆ, ಮಲ್ಲೇಶ್ವರಂ, ಬೆಂಗಳೂರು - 560003"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          {...register("image_url_kn", {
                            validate: (val) =>
                              validateImageUrl(val, { required: false, fieldLabel: "Kannada image URL" }),
                            onBlur: (e) => {
                              const cleaned = sanitizeImageUrl(e.target.value);
                              if (cleaned && cleaned !== e.target.value) {
                                setValue("image_url_kn", cleaned, { shouldValidate: true });
                              }
                            },
                          })}
                          label="ಕನ್ನಡ ಬ್ಯಾನರ್ ಚಿತ್ರದ ಲಿಂಕ್ (URL)"
                          fullWidth
                          InputLabelProps={shrinkLabel}
                          error={Boolean(errors.image_url_kn)}
                          helperText={
                            errors.image_url_kn?.message ||
                            "ಶಿಫಾರಸು ಮಾಡಿದ ಅಳತೆ: 1280 × 720 (16:9) WebP / JPG / PNG (SVG unsupported)"
                          }
                          placeholder="https://..."
                        />
                        {imageUrlKn && (
                          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              variant="rounded"
                              src={sanitizeImageUrl(imageUrlKn) || imageUrlKn}
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 4: Schedule, Timezone & Visibility */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<CalendarMonth color="primary" />}
            title="Schedule, Timezone & Visibility"
            subheader="Event start, end, publishing date, and timezone configuration (All times must be entered in Indian Standard Time - IST)"
          />
          <Divider />
          <CardContent>
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>Note:</strong> Please enter all event schedule and visibility dates and times in <strong>Indian Standard Time (IST)</strong>.
            </Alert>
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
                      label="Event Start Date & Time (IST) *"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.start_datetime)}
                      helperText={errors.start_datetime?.message || "Time in IST"}
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
                      label="Event End Date & Time (IST) *"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.end_datetime)}
                      helperText={errors.end_datetime?.message || "Time in IST"}
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
                      label="Visible in App From (IST)"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      helperText="Time in IST. Date from which the event appears in the mobile app list"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  {...register("event_timezone")}
                  label="Event Timezone"
                  fullWidth
                  InputLabelProps={shrinkLabel}
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
                  InputLabelProps={shrinkLabel}
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
                  InputLabelProps={shrinkLabel}
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
                  InputLabelProps={shrinkLabel}
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
