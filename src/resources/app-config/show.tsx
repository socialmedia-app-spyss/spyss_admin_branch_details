import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Android as AndroidIcon,
  Apple as AppleIcon,
  BuildCircle as BuildCircleIcon,
  CheckCircle,
  Construction,
  Edit as EditIcon,
  OpenInNew,
  PhoneIphone,
  SystemSecurityUpdate,
} from "@mui/icons-material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { useNavigate } from "react-router-dom";
import type { AppConfig } from "../../types/appConfig";

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(value))
    : "—";

export const AppConfigShow: React.FC = () => {
  const navigate = useNavigate();
  const { query } = useShow<AppConfig>({ resource: "app_config" });
  const [previewTab, setPreviewTab] = useState<"maintenance" | "update">("maintenance");

  const record = query.data?.data;
  const isLoading = query.isLoading;

  if (isLoading) {
    return (
      <Show title="App Configuration Details">
        <Box display="grid" sx={{ placeItems: "center" }} minHeight={320}>
          <CircularProgress />
        </Box>
      </Show>
    );
  }

  if (!record) {
    return (
      <Show title="App Configuration Details">
        <Alert severity="error">Unable to load configuration for this platform.</Alert>
      </Show>
    );
  }

  const isAndroid = record.platform === "android";
  const platformName = isAndroid ? "Google Android" : "Apple iOS";
  const Icon = isAndroid ? AndroidIcon : AppleIcon;
  const brandColor = isAndroid ? "#3DDC84" : "#007AFF";

  return (
    <Show
      title={`${platformName} Configuration`}
      headerButtons={({ defaultButtons }) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/app-config/edit/${record.platform}`)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Edit Configuration
          </Button>
          {defaultButtons}
        </Stack>
      )}
    >
      <Grid container spacing={3}>
        {/* Left Column: Config Overview & Field Details */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Platform Banner Card */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                borderTop: "6px solid",
                borderTopColor: brandColor,
                boxShadow: 1,
              }}
            >
              <CardHeader
                avatar={
                  <Icon
                    sx={{ fontSize: 40, color: isAndroid ? brandColor : "text.primary" }}
                  />
                }
                title={
                  <Typography variant="h5" fontWeight={800}>
                    {platformName}
                  </Typography>
                }
                subheader={`Database Primary Key: ${record.platform}`}
                action={
                  <Chip
                    label={record.platform.toUpperCase()}
                    color={isAndroid ? "success" : "default"}
                    sx={{ fontWeight: 800, px: 1 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          record.is_app_running
                            ? theme.palette.mode === "dark"
                              ? "rgba(46, 125, 50, 0.12)"
                              : "#f1f8f3"
                            : theme.palette.mode === "dark"
                              ? "rgba(211, 47, 47, 0.12)"
                              : "#fdf2f2",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        APP AVAILABILITY
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        {record.is_app_running ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Construction color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          color={record.is_app_running ? "success.main" : "error.main"}
                        >
                          {record.is_app_running ? "Operational" : "Under Maintenance"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          record.force_update_active
                            ? theme.palette.mode === "dark"
                              ? "rgba(237, 108, 2, 0.12)"
                              : "#fff8f1"
                            : theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.04)"
                              : "#f8f9fa",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        FORCE UPDATE
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <SystemSecurityUpdate
                          color={record.force_update_active ? "warning" : "action"}
                          fontSize="small"
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          color={
                            record.force_update_active ? "warning.main" : "text.secondary"
                          }
                        >
                          {record.force_update_active ? "Enforced Active" : "Disabled (Optional)"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Maintenance Details */}
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Maintenance Mode Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance Title:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {record.maintenance_title}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance Message:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.25 }}>
                    {record.maintenance_message}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Force Update Details */}
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Force Update & Version Enforcement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Minimum Required Build Number:
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={`Build #${record.min_build_number}`}
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      App Store URL:
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNew fontSize="small" />}
                        component="a"
                        href={record.store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: "none", py: 0.25 }}
                      >
                        Visit Store Page
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Update Dialog Title:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {record.update_title}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Update Dialog Message:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.25 }}>
                    {record.update_message}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Audit Trail Card */}
            <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2.5, bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                Audit Trail & DB Triggers
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Last Updated At:</strong> {formatDateTime(record.updated_at)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                • Trigger <code>set_app_config_updated_at</code> automatically maintains timestamps.
                <br />• Trigger <code>on_app_config_change</code> broadcasts FCM payload updates to
                mobile apps.
              </Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Live Mobile Preview */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardHeader
                title="Simulated Device Screen"
                subheader={`Rendering for ${platformName}`}
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
                        bgcolor: record.is_app_running
                          ? "background.default"
                          : "background.paper",
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          bgcolor: record.is_app_running ? "success.light" : "warning.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2.5,
                          boxShadow: 2,
                        }}
                      >
                        {record.is_app_running ? (
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
                        {record.maintenance_title}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.5, px: 1 }}
                      >
                        {record.maintenance_message}
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
                        SPYSS Yoga App • {record.platform.toUpperCase()}
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
                          {record.update_title}
                        </Typography>

                        <Chip
                          size="small"
                          label={`Requires v${record.min_build_number}+`}
                          color="info"
                          sx={{ height: 18, fontSize: "0.65rem", mb: 1.5, fontWeight: 700 }}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 2, lineHeight: 1.4 }}
                        >
                          {record.update_message}
                        </Typography>

                        <Tooltip title={record.store_url}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            component="a"
                            href={record.store_url}
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
                        </Tooltip>
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
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Show>
  );
};
