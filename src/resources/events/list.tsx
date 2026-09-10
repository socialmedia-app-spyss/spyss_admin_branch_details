import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  CollectionsOutlined,
  Event as EventIcon,
  FiberManualRecord,
  Map as MapIcon,
  NotificationsActive,
  OpenInNew,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import type { AppEvent } from "../../types/event";
import { EVENT_CATEGORIES } from "../../types/event";
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

export const getEventStatus = (event: AppEvent) => {
  if (!event.is_active) return { label: "Inactive", color: "default" as const };
  const now = Date.now();
  const start = event.start_datetime ? new Date(event.start_datetime).getTime() : null;
  const end = event.end_datetime ? new Date(event.end_datetime).getTime() : null;
  if (end && end < now) return { label: "Completed", color: "default" as const };
  if (start && start > now) return { label: "Upcoming", color: "info" as const };
  if (start && start <= now && (!end || end >= now))
    return { label: "Ongoing", color: "success" as const };
  return { label: "Unscheduled", color: "warning" as const };
};

export const EventList = () => {
  const { language } = useLanguage();

  const { dataGridProps } = useDataGrid<AppEvent>({
    resource: "app_events",
    sorters: { initial: [{ field: "start_datetime", order: "desc" }] },
  });

  const rows = (dataGridProps.rows || []) as AppEvent[];

  // KPI calculations
  const totalCount = rows.length;
  const ongoingCount = rows.filter((e) => getEventStatus(e).label === "Ongoing").length;
  const upcomingCount = rows.filter((e) => getEventStatus(e).label === "Upcoming").length;
  const completedCount = rows.filter((e) => getEventStatus(e).label === "Completed").length;

  const columns: GridColDef<AppEvent>[] = [
    {
      field: "event_code",
      headerName: "Code & Ver",
      width: 170,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={700}>
            {row.event_code}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v{row.version}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "title",
      headerName: "Title & Summary",
      flex: 1,
      minWidth: 240,
      valueGetter: (_, row) => {
        const titleObj = row.title || {};
        return titleObj[language] || titleObj.en || titleObj.kn || "—";
      },
      renderCell: ({ row }) => {
        const titleObj = row.title || {};
        const shortDescObj = row.short_description || {};
        const title = titleObj[language] || titleObj.en || titleObj.kn;
        const shortDesc = shortDescObj[language] || shortDescObj.en || shortDescObj.kn;

        return (
          <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {title || "—"}
            </Typography>
            {shortDesc && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {shortDesc}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "category",
      headerName: "Category",
      width: 140,
      renderCell: ({ value }) => {
        const cat = EVENT_CATEGORIES.find((c) => c.value === value) || EVENT_CATEGORIES[0];
        return (
          <Chip
            size="small"
            label={cat.label}
            color={cat.color}
            sx={{ fontWeight: 600, height: 24 }}
          />
        );
      },
    },
    {
      field: "schedule",
      headerName: "Schedule & Status",
      width: 220,
      sortable: false,
      renderCell: ({ row }) => {
        const status = getEventStatus(row);
        return (
          <Stack spacing={0.5} justifyContent="center" sx={{ height: "100%" }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip
                size="small"
                label={status.label}
                color={status.color}
                variant={status.color === "default" ? "outlined" : "filled"}
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(row.start_datetime)}
              </Typography>
            </Stack>
          </Stack>
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      width: 170,
      valueGetter: (_, row) => {
        const loc = row.location_name || {};
        return loc[language] || loc.en || loc.kn || "—";
      },
      renderCell: ({ row }) => {
        const loc = row.location_name || {};
        const locationName = loc[language] || loc.en || loc.kn;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" noWrap sx={{ maxWidth: 130 }}>
              {locationName || "—"}
            </Typography>
            {row.map_url && (
              <Tooltip title="Open Google Maps Location">
                <IconButton
                  size="small"
                  component="a"
                  href={row.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ p: 0.25 }}
                >
                  <MapIcon fontSize="inherit" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: "push_status",
      headerName: "Push Status",
      width: 140,
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.send_announcement_push) {
          return <Chip size="small" label="Disabled" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />;
        }
        return (
          <Chip
            size="small"
            label={row.announcement_sent_at ? "Broadcasted" : "Scheduled"}
            color={row.announcement_sent_at ? "success" : "warning"}
            variant="filled"
            icon={<NotificationsActive fontSize="small" />}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        );
      },
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 95,
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
    <List title="App Events & Shibiras">
      {/* KPI Cards Header */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TOTAL EVENTS
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
              <FiberManualRecord sx={{ fontSize: 12, color: "success.main" }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                ONGOING NOW
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="success.main" sx={{ mt: 0.5 }}>
              {ongoingCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2.5,
            borderLeft: "4px solid",
            borderLeftColor: "info.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(2, 136, 209, 0.1)" : "#f3f8ff",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ScheduleIcon sx={{ fontSize: 14, color: "info.main" }} />
              <Typography variant="caption" color="info.main" fontWeight={700}>
                UPCOMING
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="info.main" sx={{ mt: 0.5 }}>
              {upcomingCount}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              COMPLETED
            </Typography>
            <Typography variant="h4" fontWeight={750} color="text.secondary" sx={{ mt: 0.5 }}>
              {completedCount}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <DataGrid
        {...dataGridProps}
        columns={columns}
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
    </List>
  );
};
