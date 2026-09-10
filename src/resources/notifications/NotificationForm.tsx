import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
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
  Campaign,
  CollectionsOutlined,
  Group as GroupIcon,
  Language,
  Link as LinkIcon,
  NotificationsActive,
  OpenInNew,
  Send as SendIcon,
  TouchApp,
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
import type {
  AppNotificationInput,
  NotificationActionType,
  NotificationPriority,
  NotificationTargetType,
  NotificationType,
} from "../../types/notification";
import {
  NOTIFICATION_ACTION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TARGET_TYPES,
  NOTIFICATION_TYPES,
} from "../../types/notification";
import {
  generateNotificationCode,
  validateEnglishNotificationText,
  validateKannadaNotificationText,
} from "./normalizeNotification";
import { sanitizeImageUrl, validateImageUrl } from "../../utils/imageUrl";

type NotificationFormProps = {
  register: UseFormRegister<AppNotificationInput>;
  control: Control<AppNotificationInput>;
  errors: FieldErrors<AppNotificationInput>;
  getValues: UseFormGetValues<AppNotificationInput>;
  setValue: UseFormSetValue<AppNotificationInput>;
  watch: UseFormWatch<AppNotificationInput>;
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

export const NotificationForm: React.FC<NotificationFormProps> = ({
  register,
  control,
  errors,
  getValues,
  setValue,
  watch,
  isEdit: _isEdit = false,
}) => {
  const priority = watch("priority") || "NORMAL";
  const notifType = watch("type") || "GENERAL";
  const targetType = watch("target_type") || "ALL";
  const actionType = watch("action_type") || "NONE";
  const isActive = watch("is_active") ?? true;
  const imageUrl = watch("image_url") || "";
  const actionUrl = watch("action_url") || "";

  const handleAutoGenerateCode = () => {
    const title = getValues("title_en") || getValues("title_kn") || "";
    setValue("notification_code", generateNotificationCode(title));
  };

  const selectedPriorityMeta =
    NOTIFICATION_PRIORITIES.find((p) => p.value === priority) || NOTIFICATION_PRIORITIES[1];

  const selectedTargetMeta =
    NOTIFICATION_TARGET_TYPES.find((t) => t.value === targetType) || NOTIFICATION_TARGET_TYPES[0];

  return (
    <Box sx={{ mt: 1 }}>
      <Stack spacing={3}>
        {/* Instant FCM Push Alert Banner */}
        <Alert
          severity="info"
          icon={<SendIcon fontSize="inherit" />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Automated FCM Push Delivery
          </Typography>
          <Typography variant="body2">
            New notifications scheduled for immediate dispatch (<code>date_time &le; now()</code>)
            automatically trigger the database function <code>handle_new_immediate_app_notification()</code> to
            broadcast real-time FCM push notifications to targeted devices.
          </Typography>
        </Alert>

        {/* Card 1: Core Details, Priority & Category */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<NotificationsActive color="primary" />}
            title="Notification Code, Classification & Priority"
            subheader="Unique identifier code, notification category, and broadcast priority"
            action={
              <Chip
                label={`${selectedPriorityMeta.label} Priority`}
                color={selectedPriorityMeta.color}
                sx={{ fontWeight: 700 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <TextField
                  {...register("notification_code", {
                    required: "Notification code is required.",
                    pattern: {
                      value: /^[A-Za-z0-9-_]+$/,
                      message: "Code must contain only letters, numbers, hyphens, and underscores.",
                    },
                  })}
                  label="Notification Code *"
                  fullWidth
                  InputLabelProps={shrinkLabel}
                  error={Boolean(errors.notification_code)}
                  helperText={
                    errors.notification_code?.message ||
                    "Unique code (e.g. NOTIF-2026-YOGA-DAY-01)"
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

              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth error={Boolean(errors.type)}>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    Notification Type *
                  </Typography>
                  <Select
                    value={notifType}
                    onChange={(e) => setValue("type", e.target.value as NotificationType)}
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth error={Boolean(errors.priority)}>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    Priority *
                  </Typography>
                  <Select
                    value={priority}
                    onChange={(e) => setValue("priority", e.target.value as NotificationPriority)}
                  >
                    {NOTIFICATION_PRIORITIES.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        <Chip size="small" label={p.label} color={p.color} sx={{ height: 20 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

        {/* Card 2: Audience Targeting & Segmentation */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<GroupIcon color="primary" />}
            title="Target Audience & Segmentation"
            subheader={selectedTargetMeta.description}
            action={
              <Chip
                label={`Target: ${selectedTargetMeta.label}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    Target Audience Type *
                  </Typography>
                  <Select
                    value={targetType}
                    onChange={(e) =>
                      setValue("target_type", e.target.value as NotificationTargetType)
                    }
                  >
                    {NOTIFICATION_TARGET_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dynamic Sub-Inputs based on target_type */}
              <Grid item xs={12} md={8}>
                {targetType === "ALL" && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      📢 Broadcasts to all registered SPYSS app users across all regions.
                    </Typography>
                  </Box>
                )}

                {targetType === "VALAYA" && (
                  <TextField
                    {...register("target_valaya_id")}
                    label="Target Valaya ID / Code *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. VAL-BLR-NORTH or UUID"
                    helperText="Only users associated with this Valaya will receive this notification"
                  />
                )}

                {targetType === "BRANCH" && (
                  <TextField
                    {...register("target_branch_id")}
                    label="Target Branch ID / Code *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. BR-1002"
                    helperText="Only yogis and teachers of this specific branch will receive this notice"
                  />
                )}

                {targetType === "ROLE" && (
                  <TextField
                    {...register("target_role")}
                    label="Target User Role *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. SUPER_ADMIN, VALAYA_ADMIN, BRANCH_ADMIN, USER"
                    helperText="Dispatches only to users with the specified profile role"
                  />
                )}

                {targetType === "TOPIC" && (
                  <TextField
                    {...register("target_topic")}
                    label="FCM Topic Name *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. panchanga-daily or yoga-camp-2026"
                    helperText="Delivered to devices subscribed to this FCM broadcast topic"
                  />
                )}

                {targetType === "LANGUAGE" && (
                  <FormControl fullWidth>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                      Target App Language *
                    </Typography>
                    <Select
                      value={watch("target_language") || "kn"}
                      onChange={(e) => setValue("target_language", e.target.value)}
                    >
                      <MenuItem value="kn">ಕನ್ನಡ (Kannada Preferred Users)</MenuItem>
                      <MenuItem value="en">English (English Preferred Users)</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 3: Bilingual Localized Content (English & Kannada) */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<Translate color="primary" />}
            title="Notification Message Content"
            subheader="At least one complete language pair (Title & Body in English OR Kannada) is required"
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
                      English Message
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <TextField
                      {...register("title_en", {
                        validate: (val) => {
                          const bodyEn = getValues("body_en");
                          const titleKn = getValues("title_kn");
                          const bodyKn = getValues("body_kn");

                          const hasKn = Boolean(titleKn?.trim() && bodyKn?.trim());
                          const hasEn = Boolean(val?.trim() && bodyEn?.trim());

                          if (!hasEn && !hasKn) {
                            return "Provide both Title and Body in English or Kannada.";
                          }
                          if (val?.trim()) {
                            const langErr = validateEnglishNotificationText(val, "English Title");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="Notification Title (English)"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.title_en)}
                      helperText={
                        errors.title_en?.message || "Headline shown on lock screen and banner (letters, numbers, symbols)"
                      }
                      placeholder="e.g. Special Yoga Workshop This Sunday"
                    />

                    <TextField
                      {...register("body_en", {
                        validate: (val) => {
                          const titleEn = getValues("title_en");
                          if (titleEn?.trim() && !val?.trim()) {
                            return "English Body is required when English Title is provided.";
                          }
                          if (val?.trim()) {
                            const langErr = validateEnglishNotificationText(val, "English Body");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="Notification Body (English)"
                      fullWidth
                      multiline
                      rows={4}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.body_en)}
                      helperText={
                        errors.body_en?.message ||
                        "Full message text displayed when notification is expanded"
                      }
                      placeholder="e.g. Join our master instructors at 6:00 AM for an advanced pranayama and asana session."
                    />
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
                      ಕನ್ನಡ ಸಂದೇಶ (Kannada)
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <TextField
                      {...register("title_kn", {
                        validate: (val) => {
                          const bodyKn = getValues("body_kn");
                          const titleEn = getValues("title_en");
                          const bodyEn = getValues("body_en");

                          const hasEn = Boolean(titleEn?.trim() && bodyEn?.trim());
                          const hasKn = Boolean(val?.trim() && bodyKn?.trim());

                          if (!hasEn && !hasKn) {
                            return "Provide both Title and Body in English or Kannada.";
                          }
                          if (val?.trim()) {
                            const langErr = validateKannadaNotificationText(val, "ಕನ್ನಡ ಶೀರ್ಷಿಕೆ");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="ಸೂಚನೆ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)"
                      fullWidth
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.title_kn)}
                      helperText={
                        errors.title_kn?.message || "ಲಾಕ್‌ ಸ್ಕ್ರೀನ್‌ ಮತ್ತು ಬ್ಯಾನರ್‌ನಲ್ಲಿ ತೋರಿಸುವ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ ಮತ್ತು ಅಂಕಿಗಳು)"
                      }
                      placeholder="ಉದಾ: ಈ ಭಾನುವಾರ ವಿಶೇಷ ಯೋಗ ತರಬೇತಿ ಶಿಬಿರ 2026"
                    />

                    <TextField
                      {...register("body_kn", {
                        validate: (val) => {
                          const titleKn = getValues("title_kn");
                          if (titleKn?.trim() && !val?.trim()) {
                            return "ಕನ್ನಡ ಶೀರ್ಷಿಕೆ ನೀಡಿದಾಗ ವಿವರಣೆ ಕಡ್ಡಾಯವಾಗಿದೆ.";
                          }
                          if (val?.trim()) {
                            const langErr = validateKannadaNotificationText(val, "ಕನ್ನಡ ವಿವರಣೆ");
                            if (langErr !== true) return langErr;
                          }
                          return true;
                        },
                      })}
                      label="ಸೂಚನೆಯ ವಿವರಣೆ (ಕನ್ನಡ)"
                      fullWidth
                      multiline
                      rows={4}
                      InputLabelProps={shrinkLabel}
                      error={Boolean(errors.body_kn)}
                      helperText={
                        errors.body_kn?.message || "ಸೂಚನೆ ವಿಸ್ತರಿಸಿದಾಗ ಕಾಣಿಸುವ ಪೂರ್ಣ ವಿವರ"
                      }
                      placeholder="ಉದಾ: ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಆಸನಗಳ ಕುರಿತು ವಿಶೇಷ ತರಬೇತಿ ನಡೆಯಲಿದೆ. ಎಲ್ಲರೂ ಭಾಗವಹಿಸಿ."
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* Banner Image URL (Shared across locales) */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <TextField
                {...register("image_url", {
                  validate: (val) =>
                    validateImageUrl(val, { required: false, requireHttps: false, fieldLabel: "Notification image URL" }),
                  onBlur: (e) => {
                    const cleaned = sanitizeImageUrl(e.target.value);
                    if (cleaned && cleaned !== e.target.value) {
                      setValue("image_url", cleaned, { shouldValidate: true });
                    }
                  },
                })}
                label="Notification Banner Image URL (Optional)"
                fullWidth
                InputLabelProps={shrinkLabel}
                error={Boolean(errors.image_url)}
                helperText={
                  errors.image_url?.message ||
                  "Optional large image displayed in push notification expand view (e.g. 1024 × 512 WebP / JPG / PNG, SVG unsupported)"
                }
                placeholder="https://..."
              />
              {imageUrl && (
                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={sanitizeImageUrl(imageUrl) || imageUrl}
                    sx={{ width: 120, height: 60, borderRadius: 1.5 }}
                  >
                    <CollectionsOutlined />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Notification Image Preview
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Card 4: Interactive Action Trigger */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<TouchApp color="primary" />}
            title="Interactive Action Trigger"
            subheader="Action performed when the user taps on the push notification on device"
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                    Action Trigger Type
                  </Typography>
                  <Select
                    value={actionType}
                    onChange={(e) =>
                      setValue("action_type", e.target.value as NotificationActionType)
                    }
                  >
                    {NOTIFICATION_ACTION_TYPES.map((a) => (
                      <MenuItem key={a.value} value={a.value}>
                        {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                {actionType === "OPEN_URL" && (
                  <TextField
                    {...register("action_url", {
                      validate: (v) =>
                        actionType !== "OPEN_URL" || isValidOptionalUrl(v) === true || "Valid URL required",
                    })}
                    label="Destination Web URL *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="https://spyss.org/..."
                    error={Boolean(errors.action_url)}
                    helperText={errors.action_url?.message || "Opens this web URL in in-app browser"}
                    InputProps={{
                      endAdornment: actionUrl ? (
                        <InputAdornment position="end">
                          <Tooltip title="Test Destination URL">
                            <IconButton
                              size="small"
                              component="a"
                              href={actionUrl}
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
                )}

                {actionType === "NAVIGATE_EVENT" && (
                  <TextField
                    {...register("action_event_id")}
                    label="Target Event Code / ID *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. EVT-2026-YOGA-DAY-001"
                    helperText="Navigates directly to the specific event screen in mobile app"
                  />
                )}

                {actionType === "NAVIGATE_BRANCH" && (
                  <TextField
                    {...register("action_branch_id")}
                    label="Target Branch Code / ID *"
                    fullWidth
                    InputLabelProps={shrinkLabel}
                    placeholder="e.g. BR-1002"
                    helperText="Navigates directly to the specific branch details screen in mobile app"
                  />
                )}

                {(!actionType || actionType === "NONE") && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Opens the default Notifications history inbox in the mobile app.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 5: Schedule & Expiry */}
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardHeader
            avatar={<CalendarMonth color="primary" />}
            title="Dispatch Schedule & Expiry"
            subheader="Schedule future notifications or configure automatic expiration (All times must be entered in Indian Standard Time - IST)"
          />
          <Divider />
          <CardContent>
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>Note:</strong> Please enter all schedule and expiration dates and times in <strong>Indian Standard Time (IST)</strong>.
            </Alert>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date_time"
                  control={control}
                  rules={{ required: "Event / dispatch date time is required." }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={toDateTimeLocal(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Event / Dispatch Date & Time (IST) *"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.date_time)}
                      helperText={
                        errors.date_time?.message ||
                        "All times in IST. Leave as current time for immediate broadcast"
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="expiry_date"
                  control={control}
                  rules={{
                    validate: (exp) => {
                      const dt = getValues("date_time");
                      if (exp && dt && new Date(exp).getTime() <= new Date(dt).getTime()) {
                        return "Expiry date must be after the dispatch/event date & time.";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={toDateTimeLocal(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      label="Expiry Date & Time (IST, Optional)"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.expiry_date)}
                      helperText={
                        errors.expiry_date?.message ||
                        "All times in IST. After this date, the notification is automatically dismissed from the app inbox"
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
