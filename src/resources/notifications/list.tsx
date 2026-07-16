import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip, Stack } from "@mui/material";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import type { Notification } from "../../types/notification";

const formatDateTime = (value?: string | null) => value ? new Date(value).toLocaleString() : "—";
const getExpiryStatus = (expiryDate?: string | null) => {
  if (!expiryDate) return "NO_EXPIRY" as const;
  return new Date(expiryDate).getTime() < Date.now() ? "EXPIRED" as const : "FUTURE" as const;
};

export const NotificationList = () => {
  const { dataGridProps } = useDataGrid<Notification>({
    resource: "notifications",
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });

  const columns: GridColDef<Notification>[] = [
    { field: "notification_code", headerName: "Code", width: 150 },
    { field: "title_en", headerName: "Title", flex: 1, minWidth: 220 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "priority", headerName: "Priority", width: 120, renderCell: ({ value }) => <Chip size="small" label={value} color={value === "URGENT" ? "error" : value === "HIGH" ? "warning" : "default"} /> },
    { field: "date_time", headerName: "Event Date & Time", width: 190, valueFormatter: (value) => formatDateTime(value) },
    { field: "expiry_date", headerName: "Expires At", width: 190, valueFormatter: (value) => formatDateTime(value) },
    { field: "expiry_status", headerName: "Expiry Status", width: 130, sortable: false, filterable: false,
      renderCell: ({ row }) => {
        const status = getExpiryStatus(row.expiry_date);
        return <Chip
          size="small"
          label={status === "EXPIRED" ? "Expired" : status === "FUTURE" ? "Future" : "No expiry"}
          color={status === "EXPIRED" ? "error" : status === "FUTURE" ? "success" : "default"}
          variant={status === "NO_EXPIRY" ? "outlined" : "filled"}
        />;
      } },
    { field: "is_active", headerName: "Active", width: 100, type: "boolean" },
    { field: "version", headerName: "Version", width: 90 },
    { field: "actions", headerName: "Actions", width: 160, sortable: false, filterable: false,
      renderCell: ({ row }) => <Stack direction="row" spacing={1}>
        <ShowButton hideText recordItemId={row.id} />
        <EditButton hideText recordItemId={row.id} />
        <DeleteButton hideText recordItemId={row.id} />
      </Stack> },
  ];

  return <List title="Notifications"><DataGrid
    {...dataGridProps}
    columns={columns}
    autoHeight
    getRowClassName={({ row }) => `notification-row--${getExpiryStatus(row.expiry_date).toLowerCase()}`}
    sx={{
      "& .notification-row--expired": { bgcolor: "rgba(211, 47, 47, 0.08)" },
      "& .notification-row--expired:hover": { bgcolor: "rgba(211, 47, 47, 0.14)" },
      "& .notification-row--future": { bgcolor: "rgba(46, 125, 50, 0.07)" },
      "& .notification-row--future:hover": { bgcolor: "rgba(46, 125, 50, 0.13)" },
    }}
  /></List>;
};
