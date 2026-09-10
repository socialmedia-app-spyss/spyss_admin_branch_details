import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  CheckCircle,
  Construction,
  Edit as EditIcon,
  OpenInNew,
  PhoneAndroid,
  SystemSecurityUpdate,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { useNavigate } from "react-router-dom";
import type { AppConfig, Platform } from "../../types/appConfig";

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

export const AppConfigList: React.FC = () => {
  const navigate = useNavigate();

  const { dataGridProps } = useDataGrid<AppConfig>({
    resource: "app_config",
  });

  const rows = (dataGridProps.rows || []) as AppConfig[];

  const androidConfig = rows.find((r) => r.platform === "android");
  const iosConfig = rows.find((r) => r.platform === "ios");

  const hasAndroid = Boolean(androidConfig);
  const hasIos = Boolean(iosConfig);

  const columns: GridColDef<AppConfig>[] = [
    {
      field: "platform",
      headerName: "Platform",
      width: 170,
      renderCell: ({ value }) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
          {value === "android" ? (
            <AndroidIcon sx={{ color: "#3DDC84", fontSize: 22 }} />
          ) : (
            <AppleIcon sx={{ fontSize: 22 }} />
          )}
          <Typography variant="body2" fontWeight={700}>
            {value === "android" ? "Android" : "iOS"}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "is_app_running",
      headerName: "App Status",
      width: 170,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Operational" : "Maintenance"}
          color={value ? "success" : "error"}
          icon={value ? <CheckCircle fontSize="small" /> : <Construction fontSize="small" />}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "force_update_active",
      headerName: "Force Update",
      width: 170,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Enforced" : "Optional"}
          color={value ? "warning" : "default"}
          variant={value ? "filled" : "outlined"}
          icon={value ? <SystemSecurityUpdate fontSize="small" /> : undefined}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "min_build_number",
      headerName: "Min Build",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={`v${value}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: "maintenance_title",
      headerName: "Maintenance Notice",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.maintenance_title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.maintenance_message}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "update_title",
      headerName: "Update Notice",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.update_title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.update_message}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "store_url",
      headerName: "Store Link",
      width: 140,
      sortable: false,
      renderCell: ({ value }) =>
        value ? (
          <Tooltip title={value}>
            <Button
              size="small"
              variant="text"
              endIcon={<OpenInNew fontSize="small" />}
              component="a"
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: "none" }}
            >
              Open Store
            </Button>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      field: "updated_at",
      headerName: "Last Updated",
      width: 170,
      renderCell: ({ value }) => (
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText recordItemId={row.platform} />
          <EditButton hideText recordItemId={row.platform} />
        </Stack>
      ),
    },
  ];

  const renderPlatformCard = (platform: Platform, config?: AppConfig) => {
    const isAndroid = platform === "android";
    const title = isAndroid ? "Google Android" : "Apple iOS";
    const Icon = isAndroid ? AndroidIcon : AppleIcon;
    const brandColor = isAndroid ? "#3DDC84" : "#007AFF";

    if (!config) {
      return (
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            bgcolor: "action.hover",
            borderStyle: "dashed",
          }}
        >
          <Icon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>
            {title} Not Configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No configuration row found for {platform}. Initialize with recommended defaults.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/app-config/create?platform=${platform}`)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Configure {title}
          </Button>
        </Card>
      );
    }

    return (
      <Card
        variant="outlined"
        sx={{
          flex: 1,
          borderRadius: 3,
          borderTop: "6px solid",
          borderTopColor: brandColor,
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardHeader
          avatar={<Icon sx={{ fontSize: 36, color: isAndroid ? brandColor : "text.primary" }} />}
          title={
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>
          }
          subheader={`Target Platform: ${config.platform}`}
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/app-config/show/${config.platform}`)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Configuration">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/app-config/edit/${config.platform}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent sx={{ py: 2 }}>
          <Stack spacing={2}>
            {/* Status indicators */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      config.is_app_running
                        ? theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.12)"
                          : "#f1f8f3"
                        : theme.palette.mode === "dark"
                          ? "rgba(211, 47, 47, 0.12)"
                          : "#fdf2f2",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    APP STATUS
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color={config.is_app_running ? "success.main" : "error.main"}
                  >
                    {config.is_app_running ? "Operational" : "Maintenance Mode"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      config.force_update_active
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
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color={config.force_update_active ? "warning.main" : "text.primary"}
                  >
                    {config.force_update_active ? "Enforced Active" : "Disabled (Optional)"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Version & Notice Details */}
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Minimum Build Number:
                </Typography>
                <Chip
                  size="small"
                  label={`Build #${config.min_build_number}`}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Maintenance Title:
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                  {config.maintenance_title}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Update Dialog Title:
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                  {config.update_title}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Store Link:
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  endIcon={<OpenInNew fontSize="inherit" />}
                  component="a"
                  href={config.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", p: 0, minWidth: 0, fontSize: "0.8rem" }}
                >
                  Visit Store
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ px: 2, py: 1.5, justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            Updated: {formatDateTime(config.updated_at)}
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/app-config/edit/${config.platform}`)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Edit Config
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <List
      title="Mobile App Configuration"
      headerButtons={({ defaultButtons }) => (
        <Stack direction="row" spacing={1}>
          {(!hasAndroid || !hasIos) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app-config/create")}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Add Platform Config
            </Button>
          )}
          {defaultButtons}
        </Stack>
      )}
    >
      <Stack spacing={3}>
        {/* Helper Overview Card */}
        <Alert
          severity="info"
          icon={<PhoneAndroid fontSize="inherit" />}
          sx={{ borderRadius: 2.5 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Central Mobile App Control Hub
          </Typography>
          <Typography variant="body2">
            Configure live availability, scheduled maintenance banners, and minimum build version
            enforcements for the SPYSS Mobile Apps across Android and iOS. Changes take effect on
            devices in real-time via silent push synchronization.
          </Typography>
        </Alert>

        {/* Platform Cards Header */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderPlatformCard("android", androidConfig)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderPlatformCard("ios", iosConfig)}
          </Grid>
        </Grid>

        {/* DataGrid Table View */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Platform Configurations Table
          </Typography>
          <DataGrid
            {...dataGridProps}
            columns={columns}
            getRowId={(row) => row.platform}
            autoHeight
            rowHeight={64}
            sx={{
              borderRadius: 2.5,
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        </Box>
      </Stack>
    </List>
  );
};
