import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  CheckCircle,
  ErrorOutline,
  HourglassEmpty,
  NotificationsActive,
  Send as SendIcon,
  Sync,
} from "@mui/icons-material";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import type { AppNotification } from "../../types/notification";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TARGET_TYPES,
  NOTIFICATION_TYPES,
} from "../../types/notification";
import { useLanguage } from "../../hooks/useLanguage";

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

const getExpiryStatus = (expiryDate?: string | null) => {
  if (!expiryDate) return "NO_EXPIRY" as const;
  return new Date(expiryDate).getTime() < Date.now() ? ("EXPIRED" as const) : ("FUTURE" as const);
};

const getSendStatusColor = (
  status: string
): "default" | "info" | "warning" | "error" | "success" => {
  switch (status) {
    case "SENT":
      return "success";
    case "PENDING":
      return "warning";
    case "PROCESSING":
      return "info";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
};

export const NotificationList = () => {
  const { language } = useLanguage();

  const { dataGridProps } = useDataGrid<AppNotification>({
    resource: "app_notifications",
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });

  const rows = (dataGridProps.rows || []) as AppNotification[];

  // KPI calculations
  const totalCount = rows.length;
  const sentCount = rows.filter((n) => n.send_status === "SENT").length;
  const pendingCount = rows.filter((n) => n.send_status === "PENDING").length;
  const failedCount = rows.filter(
    (n) => n.send_status === "FAILED" || n.send_status === "CANCELLED"
  ).length;

  const columns: GridColDef<AppNotification>[] = [
    {
      field: "notification_code",
      headerName: "Code & Ver",
      width: 170,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={700}>
            {row.notification_code}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v{row.version}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "title",
      headerName: "Title & Body Preview",
      flex: 1,
      minWidth: 240,
      valueGetter: (_, row) => {
        const titleObj = row.title || {};
        return titleObj[language] || titleObj.en || titleObj.kn || "—";
      },
      renderCell: ({ row }) => {
        const titleObj = row.title || {};
        const bodyObj = row.body || {};
        const title = titleObj[language] || titleObj.en || titleObj.kn;
        const body = bodyObj[language] || bodyObj.en || bodyObj.kn;

        return (
          <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {title || "—"}
            </Typography>
            {body && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {body}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 140,
      renderCell: ({ value }) => {
        const typeMeta = NOTIFICATION_TYPES.find((t) => t.value === value);
        return (
          <Chip
            size="small"
            label={typeMeta?.label || value}
            variant="outlined"
            sx={{ fontWeight: 600, height: 24 }}
          />
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      renderCell: ({ value }) => {
        const priorityMeta = NOTIFICATION_PRIORITIES.find((p) => p.value === value);
        return (
          <Chip
            size="small"
            label={value}
            color={priorityMeta?.color || "default"}
            sx={{ fontWeight: 700, height: 22, fontSize: "0.7rem" }}
          />
        );
      },
    },
    {
      field: "target_type",
      headerName: "Target Audience",
      width: 140,
      renderCell: ({ row }) => {
        const targetMeta = NOTIFICATION_TARGET_TYPES.find((t) => t.value === row.target_type);
        return (
          <Tooltip title={JSON.stringify(row.target_payload || {})}>
            <Chip
              size="small"
              label={targetMeta?.label || row.target_type}
              color={row.target_type === "ALL" ? "default" : "primary"}
              variant={row.target_type === "ALL" ? "outlined" : "filled"}
              sx={{ fontWeight: 600, height: 22, fontSize: "0.7rem" }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "send_status",
      headerName: "Delivery Status",
      width: 140,
      renderCell: ({ row }) => {
        const color = getSendStatusColor(row.send_status);
        return (
          <Chip
            size="small"
            label={row.send_status}
            color={color}
            variant="filled"
            icon={
              row.send_status === "SENT" ? (
                <CheckCircle fontSize="small" />
              ) : row.send_status === "PENDING" ? (
                <HourglassEmpty fontSize="small" />
              ) : row.send_status === "PROCESSING" ? (
                <Sync fontSize="small" />
              ) : row.send_status === "FAILED" ? (
                <ErrorOutline fontSize="small" />
              ) : undefined
            }
            sx={{ fontWeight: 700, height: 24 }}
          />
        );
      },
    },
    {
      field: "date_time",
      headerName: "Dispatch Date",
      width: 170,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 90,
      type: "boolean",
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Active" : "Inactive"}
          color={value ? "success" : "default"}
          variant={value ? "filled" : "outlined"}
          sx={{ height: 20, fontSize: "0.7rem" }}
        />
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
          <ShowButton hideText recordItemId={row.id} />
          <EditButton hideText recordItemId={row.id} />
          <DeleteButton hideText recordItemId={row.id} />
        </Stack>
      ),
    },
  ];

  return (
    <List title="App Notifications & Broadcasts">
      {/* KPI Cards Header */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TOTAL NOTIFICATIONS
            </Typography>
            <Typography variant="h4" fontWeight={750} sx={{ mt: 0.5 }}>
              {totalCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2.5,
            borderLeft: "4px solid",
            borderLeftColor: "success.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(46, 125, 50, 0.1)" : "#f3faf5",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <SendIcon sx={{ fontSize: 13, color: "success.main" }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                SENT / BROADCASTED
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="success.main" sx={{ mt: 0.5 }}>
              {sentCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2.5,
            borderLeft: "4px solid",
            borderLeftColor: "warning.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(237, 108, 2, 0.1)" : "#fff9f1",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <HourglassEmpty sx={{ fontSize: 13, color: "warning.main" }} />
              <Typography variant="caption" color="warning.main" fontWeight={700}>
                PENDING SCHEDULED
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="warning.main" sx={{ mt: 0.5 }}>
              {pendingCount}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              FAILED / CANCELLED
            </Typography>
            <Typography variant="h4" fontWeight={750} color="text.secondary" sx={{ mt: 0.5 }}>
              {failedCount}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <DataGrid
        {...dataGridProps}
        columns={columns}
        autoHeight
        rowHeight={64}
        getRowClassName={({ row }) =>
          `notif-row--${getExpiryStatus(row.expiry_date).toLowerCase()}`
        }
        sx={{
          borderRadius: 2.5,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          "& .notif-row--expired": { bgcolor: "rgba(211, 47, 47, 0.04)" },
          "& .notif-row--expired:hover": { bgcolor: "rgba(211, 47, 47, 0.08)" },
        }}
      />
    </List>
  );
};
