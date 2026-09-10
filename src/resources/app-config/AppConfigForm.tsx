import React, { useState } from "react";
import {
  Alert,
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
  Android as AndroidIcon,
  Apple as AppleIcon,
  BuildCircle as BuildCircleIcon,
  CheckCircleOutline,
  CloudSync,
  Construction,
  InfoOutlined,
  OpenInNew,
  PhoneIphone,
  SystemSecurityUpdate,
  WarningAmber,
} from "@mui/icons-material";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { AppConfigInput, Platform } from "../../types/appConfig";

interface AppConfigFormProps {
  register: UseFormRegister<AppConfigInput>;
  control: Control<AppConfigInput>;
  errors: FieldErrors<AppConfigInput>;
  getValues: UseFormGetValues<AppConfigInput>;
  setValue: UseFormSetValue<AppConfigInput>;
  watch: UseFormWatch<AppConfigInput>;
  isEdit?: boolean;
}

export const AppConfigForm: React.FC<AppConfigFormProps> = ({
  register,
  errors,
  setValue,
  watch,
  isEdit = false,
}) => {
  const [previewTab, setPreviewTab] = useState<"maintenance" | "update">("maintenance");

  const platform = watch("platform") || "android";
  const isAppRunning = watch("is_app_running") ?? true;
  const forceUpdateActive = watch("force_update_active") ?? false;
  const minBuildNumber = watch("min_build_number") ?? 1;
  const maintenanceTitle = watch("maintenance_title") || "Under Maintenance";
  const maintenanceMessage =
    watch("maintenance_message") ||
    "The SPYSS App is temporarily unavailable. Please try again shortly.";
  const updateTitle = watch("update_title") || "Update Required";
  const updateMessage =
    watch("update_message") || "Please update the SPYSS App to continue.";
  const storeUrl = watch("store_url") || "";

  const isAndroid = platform === "android";

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Left Column: Form Fields */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Real-time Broadcast Notice */}
            <Alert
              icon={<CloudSync fontSize="inherit" />}
              severity="info"
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "info.light",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Live FCM Config Synchronization
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.25 }}>
                Saving changes triggers an automated FCM silent broadcast to all active mobile
                clients, immediately applying the latest configuration.
              </Typography>
            </Alert>

            {/* Platform Selection */}
            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardHeader
                title="Target Platform"
                subheader="Select the mobile operating system for this configuration"
                avatar={
                  isAndroid ? (
                    <AndroidIcon sx={{ color: "#3DDC84", fontSize: 32 }} />
                  ) : (
                    <AppleIcon sx={{ color: "text.primary", fontSize: 32 }} />
                  )
                }
                action={
                  <Chip
                    label={isAndroid ? "Google Android" : "Apple iOS"}
                    color={isAndroid ? "success" : "default"}
                    variant="filled"
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                {isEdit ? (
                  <TextField
                    fullWidth
                    label="Platform (Primary Key)"
                    value={platform === "android" ? "Android (Google Play)" : "iOS (Apple App Store)"}
                    disabled
                    helperText="Platform cannot be changed after creation."
                  />
                ) : (
                  <FormControl fullWidth error={Boolean(errors.platform)}>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                      Platform *
                    </Typography>
                    <Select
                      value={platform}
                      onChange={(e) => setValue("platform", e.target.value as Platform)}
                    >
                      <MenuItem value="android">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AndroidIcon sx={{ color: "#3DDC84", fontSize: 20 }} />
                          <Typography>Android (Google Play)</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="ios">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AppleIcon sx={{ fontSize: 20 }} />
                          <Typography>iOS (Apple App Store)</Typography>
                        </Stack>
                      </MenuItem>
                    </Select>
                    {errors.platform && (
                      <FormHelperText>{errors.platform.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </CardContent>
            </Card>

            {/* Card 1: App Status & Maintenance Mode */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                borderLeft: "4px solid",
                borderLeftColor: isAppRunning ? "success.main" : "error.main",
              }}
            >
              <CardHeader
                title="App Availability & Maintenance Mode"
                subheader="Control whether the app is operational or undergoing scheduled maintenance"
                avatar={
                  isAppRunning ? (
                    <CheckCircleOutline color="success" />
                  ) : (
                    <Construction color="error" />
                  )
                }
                action={
                  <Chip
                    label={isAppRunning ? "APP OPERATIONAL" : "MAINTENANCE ACTIVE"}
                    color={isAppRunning ? "success" : "error"}
                    sx={{ fontWeight: 700 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        isAppRunning
                          ? theme.palette.mode === "dark"
                            ? "rgba(46, 125, 50, 0.12)"
                            : "#f1f8f3"
                          : theme.palette.mode === "dark"
                            ? "rgba(211, 47, 47, 0.12)"
                            : "#fdf2f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        App Running Status (`is_app_running`)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {isAppRunning
                          ? "The app is live and accepting all user traffic normally."
                          : "The app is blocked. Users will see the maintenance screen below."}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(isAppRunning)}
                          onChange={(e) => setValue("is_app_running", e.target.checked)}
                          color="success"
                        />
                      }
                      label={isAppRunning ? "Running" : "Maintenance"}
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {!isAppRunning && (
                    <Alert
                      severity="warning"
                      icon={<WarningAmber fontSize="inherit" />}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <strong>Caution:</strong> Maintenance mode is currently enabled. All mobile
                      users on <strong>{platform.toUpperCase()}</strong> will be blocked from
                      logging in or navigating the app until this is toggled back ON.
                    </Alert>
                  )}

                  <TextField
                    {...register("maintenance_title", {
                      required: "Maintenance title is required",
                    })}
                    label="Maintenance Title"
                    fullWidth
                    error={Boolean(errors.maintenance_title)}
                    helperText={
                      errors.maintenance_title?.message ||
                      "Headline displayed on the mobile maintenance screen"
                    }
                    placeholder="Under Maintenance"
                  />

                  <TextField
                    {...register("maintenance_message", {
                      required: "Maintenance message is required",
                    })}
                    label="Maintenance Message"
                    fullWidth
                    multiline
                    rows={3}
                    error={Boolean(errors.maintenance_message)}
                    helperText={
                      errors.maintenance_message?.message ||
                      "Detailed explanatory message shown to users during downtime"
                    }
                    placeholder="The SPYSS App is temporarily unavailable. Please try again shortly."
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Card 2: Force Update & Version Enforcement */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                borderLeft: "4px solid",
                borderLeftColor: forceUpdateActive ? "warning.main" : "info.main",
              }}
            >
              <CardHeader
                title="Force Update & Minimum Version"
                subheader="Enforce minimum required app build numbers and redirect users to app store"
                avatar={<SystemSecurityUpdate color={forceUpdateActive ? "warning" : "info"} />}
                action={
                  <Chip
                    label={forceUpdateActive ? "FORCE UPDATE ACTIVE" : "UPDATE OPTIONAL"}
                    color={forceUpdateActive ? "warning" : "default"}
                    sx={{ fontWeight: 700 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        forceUpdateActive
                          ? theme.palette.mode === "dark"
                            ? "rgba(237, 108, 2, 0.12)"
                            : "#fff8f1"
                          : theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.04)"
                            : "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Enforce Force Update (`force_update_active`)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {forceUpdateActive
                          ? "Users on older builds will be blocked until they update the app."
                          : "Force update dialog is inactive. Older builds can continue running."}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(forceUpdateActive)}
                          onChange={(e) => setValue("force_update_active", e.target.checked)}
                          color="warning"
                        />
                      }
                      label={forceUpdateActive ? "Active" : "Inactive"}
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  <TextField
                    {...register("min_build_number", {
                      required: "Minimum build number is required",
                      min: { value: 1, message: "Build number must be greater than 0" },
                      valueAsNumber: true,
                    })}
                    label="Minimum Required Build Number"
                    type="number"
                    fullWidth
                    error={Boolean(errors.min_build_number)}
                    helperText={
                      errors.min_build_number?.message ||
                      "Mobile apps with a build number below this value will be prompted/forced to update (e.g. 142)"
                    }
                    InputProps={{
                      inputProps: { min: 1, step: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Chip size="small" label="Build #" variant="outlined" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("update_title", {
                      required: "Update title is required",
                    })}
                    label="Update Dialog Title"
                    fullWidth
                    error={Boolean(errors.update_title)}
                    helperText={
                      errors.update_title?.message || "Title shown on the force update popup"
                    }
                    placeholder="Update Required"
                  />

                  <TextField
                    {...register("update_message", {
                      required: "Update message is required",
                    })}
                    label="Update Dialog Message"
                    fullWidth
                    multiline
                    rows={2}
                    error={Boolean(errors.update_message)}
                    helperText={
                      errors.update_message?.message ||
                      "Instructions encouraging users to update to the latest release"
                    }
                    placeholder="Please update the SPYSS App to continue."
                  />

                  <TextField
                    {...register("store_url", {
                      required: "Store URL is required",
                      validate: (v) =>
                        (v && v.trim().length > 0) || "Store URL cannot be empty",
                    })}
                    label={isAndroid ? "Google Play Store URL" : "Apple App Store URL"}
                    fullWidth
                    error={Boolean(errors.store_url)}
                    helperText={
                      errors.store_url?.message ||
                      "Direct link opened when the user clicks 'Update Now' on mobile"
                    }
                    placeholder={
                      isAndroid
                        ? "https://play.google.com/store/apps/details?id=org.spyss.app"
                        : "https://apps.apple.com/app/spyss/id6446219356"
                    }
                    InputProps={{
                      endAdornment: storeUrl ? (
                        <InputAdornment position="end">
                          <Tooltip title="Test Store Link in New Tab">
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNew fontSize="small" />}
                              component="a"
                              href={storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: "none", py: 0.5 }}
                            >
                              Test URL
                            </Button>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Live Mobile Screen Mockup / Simulator */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardHeader
                title="Live Mobile Screen Preview"
                subheader="Real-time rendering of user experience on device"
                avatar={<PhoneIphone color="primary" />}
                action={
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      variant={previewTab === "maintenance" ? "contained" : "outlined"}
                      onClick={() => setPreviewTab("maintenance")}
                      sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: 2 }}
                    >
                      Maintenance
                    </Button>
                    <Button
                      size="small"
                      variant={previewTab === "update" ? "contained" : "outlined"}
                      onClick={() => setPreviewTab("update")}
                      sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: 2 }}
                    >
                      Force Update
                    </Button>
                  </Stack>
                }
              />
              <Divider />
              <CardContent sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                {/* Phone Simulator Frame */}
                <Box
                  sx={{
                    width: 290,
                    minHeight: 520,
                    borderRadius: "36px",
                    border: "10px solid #1e293b",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                    bgcolor: "background.paper",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Speaker / Camera Notch */}
                  <Box
                    sx={{
                      width: 100,
                      height: 18,
                      bgcolor: "#1e293b",
                      borderRadius: "0 0 12px 12px",
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{ width: 36, height: 4, bgcolor: "#334155", borderRadius: 2 }}
                    />
                    <Box
                      sx={{ width: 8, height: 8, bgcolor: "#0f172a", borderRadius: "50%" }}
                    />
                  </Box>

                  {/* Status Bar */}
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.65rem" }}>
                      9:41
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {isAndroid ? "5G" : "LTE"}
                      </Typography>
                      {isAndroid ? (
                        <AndroidIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      ) : (
                        <AppleIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                      )}
                    </Stack>
                  </Box>

                  {/* Screen Content */}
                  {previewTab === "maintenance" ? (
                    <Box
                      sx={{
                        flex: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        bgcolor: isAppRunning ? "background.default" : "background.paper",
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          bgcolor: isAppRunning ? "success.light" : "warning.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2.5,
                          boxShadow: 2,
                        }}
                      >
                        {isAppRunning ? (
                          <BuildCircleIcon sx={{ fontSize: 40, color: "success.dark" }} />
                        ) : (
                          <Construction sx={{ fontSize: 40, color: "warning.dark" }} />
                        )}
                      </Box>

                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ mb: 1, lineHeight: 1.3 }}
                      >
                        {maintenanceTitle}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.5, px: 1 }}
                      >
                        {maintenanceMessage}
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        disabled
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          py: 1,
                        }}
                      >
                        Retry Connection
                      </Button>

                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 2, fontSize: "0.6rem" }}
                      >
                        SPYSS Yoga App • {platform.toUpperCase()}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        bgcolor: "rgba(0,0,0,0.35)",
                      }}
                    >
                      {/* Modal Dialog Mock */}
                      <Card
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          textAlign: "center",
                          boxShadow: 4,
                          bgcolor: "background.paper",
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: "primary.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 1.5,
                          }}
                        >
                          <SystemSecurityUpdate color="primary" sx={{ fontSize: 28 }} />
                        </Box>

                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                          {updateTitle}
                        </Typography>

                        <Chip
                          size="small"
                          label={`Requires v${minBuildNumber}+`}
                          color="info"
                          sx={{ height: 18, fontSize: "0.65rem", mb: 1.5, fontWeight: 700 }}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 2, lineHeight: 1.4 }}
                        >
                          {updateMessage}
                        </Typography>

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          component="a"
                          href={storeUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            py: 0.75,
                          }}
                        >
                          Update Now
                        </Button>

                        {!forceUpdateActive && (
                          <Button
                            variant="text"
                            size="small"
                            fullWidth
                            sx={{
                              mt: 0.5,
                              textTransform: "none",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                            }}
                          >
                            Later
                          </Button>
                        )}
                      </Card>
                    </Box>
                  )}

                  {/* Home Indicator Bar */}
                  <Box
                    sx={{
                      width: 100,
                      height: 4,
                      bgcolor: "#64748b",
                      borderRadius: 2,
                      mx: "auto",
                      mb: 1.5,
                      mt: "auto",
                    }}
                  />
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2, bgcolor: "action.hover" }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <InfoOutlined fontSize="small" color="action" sx={{ mt: 0.2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Toggle between the tabs above to preview how the mobile app presents the
                    Maintenance downtime screen or the Version Update modal dialog to yogis and
                    instructors.
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
