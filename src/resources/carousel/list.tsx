import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Close as CloseIcon,
  CollectionsOutlined,
  FiberManualRecord,
  LinkOutlined,
  ScheduleOutlined,
  YouTube,
} from "@mui/icons-material";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import type { AppCarousel } from "../../types/carousel";
import { getCarouselScheduleStatus } from "./normalizeCarousel";
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

const getActionColor = (
  actionType: string,
): "primary" | "secondary" | "error" | "warning" | "info" | "default" | "success" => {
  switch (actionType) {
    case "URL":
      return "info";
    case "YOUTUBE":
      return "error";
    case "EVENT":
      return "secondary";
    case "BRANCH":
      return "primary";
    case "ARTICLE":
      return "warning";
    case "FESTIVAL":
      return "success";
    default:
      return "default";
  }
};

export const CarouselList = () => {
  const { language } = useLanguage();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { dataGridProps } = useDataGrid<AppCarousel>({
    resource: "app_carousel",
    sorters: {
      initial: [
        { field: "created_at", order: "desc" },
      ],
    },
  });

  const rows = (dataGridProps.rows || []) as AppCarousel[];

  // KPI Calculations
  const totalCount = rows.length;
  const liveCount = rows.filter(
    (c) => getCarouselScheduleStatus(c).status === "LIVE" || getCarouselScheduleStatus(c).status === "ALWAYS_ACTIVE",
  ).length;
  const upcomingCount = rows.filter((c) => getCarouselScheduleStatus(c).status === "UPCOMING").length;
  const expiredCount = rows.filter(
    (c) => getCarouselScheduleStatus(c).status === "EXPIRED" || !c.is_active,
  ).length;

  const columns: GridColDef<AppCarousel>[] = [
    {
      field: "thumbnail",
      headerName: "Banner Preview",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const trans = row.translations || {};
        const imgUrl =
          trans[language]?.image_url ||
          trans[row.default_locale]?.image_url ||
          trans.en?.image_url ||
          Object.values(trans)[0]?.image_url;

        if (!imgUrl) {
          return (
            <Avatar variant="rounded" sx={{ width: 80, height: 44, bgcolor: "action.hover" }}>
              <CollectionsOutlined fontSize="small" sx={{ color: "text.secondary" }} />
            </Avatar>
          );
        }

        return (
          <Tooltip title="Click to view full image">
            <Box
              component="img"
              src={imgUrl}
              alt={row.carousel_code}
              onClick={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                setPreviewImageUrl(imgUrl);
              }}
              sx={{
                width: 90,
                height: 48,
                borderRadius: 1.5,
                objectFit: "cover",
                cursor: "pointer",
                border: "1px solid",
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "carousel_code",
      headerName: "Carousel Code",
      width: 180,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
            {row.carousel_code}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Locale: {row.default_locale || "en"}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "title",
      headerName: "Title & Caption",
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => {
        const trans = row.translations || {};
        return (
          trans[language]?.title ||
          trans[row.default_locale]?.title ||
          trans.en?.title ||
          "—"
        );
      },
      renderCell: ({ row }) => {
        const trans = row.translations || {};
        const title =
          trans[language]?.title ||
          trans[row.default_locale]?.title ||
          trans.en?.title ||
          trans.kn?.title;
        const subtitle =
          trans[language]?.subtitle ||
          trans[row.default_locale]?.subtitle ||
          trans.en?.subtitle ||
          trans.kn?.subtitle;

        return (
          <Stack spacing={0.25} justifyContent="center" sx={{ height: "100%" }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {title || "—"}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "action_type",
      headerName: "Action Trigger",
      width: 160,
      renderCell: ({ row }) => {
        const actionColor = getActionColor(row.action_type);
        return (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip
              size="small"
              label={row.action_type}
              color={actionColor}
              variant={row.action_type === "NONE" ? "outlined" : "filled"}
              icon={
                row.action_type === "YOUTUBE" ? (
                  <YouTube fontSize="small" />
                ) : row.action_type === "URL" ? (
                  <LinkOutlined fontSize="small" />
                ) : undefined
              }
            />
          </Stack>
        );
      },
    },
    {
      field: "schedule_status",
      headerName: "Schedule & Status",
      width: 190,
      sortable: false,
      renderCell: ({ row }) => {
        const schedule = getCarouselScheduleStatus(row);
        return (
          <Stack spacing={0.5} justifyContent="center" sx={{ height: "100%" }}>
            <Chip
              size="small"
              label={schedule.label}
              color={schedule.color}
              variant={schedule.status === "ALWAYS_ACTIVE" ? "outlined" : "filled"}
              sx={{ width: "fit-content", fontWeight: 600 }}
            />
            {row.start_at || row.end_at ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.start_at ? formatDateTime(row.start_at) : "Anytime"} → {row.end_at ? formatDateTime(row.end_at) : "No end"}
              </Typography>
            ) : null}
          </Stack>
        );
      },
    },
    {
      field: "locales",
      headerName: "Locales",
      width: 130,
      sortable: false,
      renderCell: ({ row }) => {
        const transKeys = Object.keys(row.translations || {});
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {transKeys.length > 0 ? (
              transKeys.map((key) => (
                <Chip
                  key={key}
                  size="small"
                  label={key.toUpperCase()}
                  variant={key === row.default_locale ? "filled" : "outlined"}
                  color={key === row.default_locale ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled">—</Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 100,
      type: "boolean",
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Active" : "Inactive"}
          color={value ? "success" : "default"}
          variant={value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
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
    <List title="App Carousel Banners">
      {/* KPI Cards Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TOTAL BANNERS
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
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(46, 125, 50, 0.1)" : "#f3faf5",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FiberManualRecord sx={{ fontSize: 12, color: "success.main" }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                LIVE NOW
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="success.main" sx={{ mt: 0.5 }}>
              {liveCount}
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
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(2, 136, 209, 0.1)" : "#f3f8ff",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ScheduleOutlined sx={{ fontSize: 14, color: "info.main" }} />
              <Typography variant="caption" color="info.main" fontWeight={700}>
                UPCOMING
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={750} color="info.main" sx={{ mt: 0.5 }}>
              {upcomingCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 2.5,
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(211, 47, 47, 0.08)" : "#fff9f9",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              EXPIRED / INACTIVE
            </Typography>
            <Typography variant="h4" fontWeight={750} color="text.secondary" sx={{ mt: 0.5 }}>
              {expiredCount}
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

      {/* Full Image Preview Dialog */}
      <Dialog
        open={Boolean(previewImageUrl)}
        onClose={() => setPreviewImageUrl(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1, position: "relative", bgcolor: "background.paper" }}>
          <IconButton
            onClick={() => setPreviewImageUrl(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          {previewImageUrl && (
            <Box
              component="img"
              src={previewImageUrl}
              alt="Full Preview"
              sx={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </List>
  );
};
