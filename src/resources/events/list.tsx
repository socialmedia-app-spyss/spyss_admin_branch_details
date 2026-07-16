import { Chip, Stack } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import type { Event } from "../../types/event";

const formatDateTime = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value))
  : "—";

const getEventStatus = (event: Event) => {
  if (!event.is_active) return { label: "Inactive", color: "default" as const };
  const now = Date.now();
  const start = event.start_datetime ? new Date(event.start_datetime).getTime() : null;
  const end = event.end_datetime ? new Date(event.end_datetime).getTime() : null;
  if (end && end < now) return { label: "Completed", color: "default" as const };
  if (start && start > now) return { label: "Upcoming", color: "info" as const };
  if (start && start <= now && (!end || end >= now)) return { label: "Ongoing", color: "success" as const };
  return { label: "Unscheduled", color: "warning" as const };
};

export const EventList = () => {
  const { dataGridProps } = useDataGrid<Event>({
    resource: "events",
    sorters: { initial: [{ field: "start_datetime", order: "desc" }] },
  });

  const columns: GridColDef<Event>[] = [
    { field: "event_name_en", headerName: "Event", flex: 1, minWidth: 240 },
    { field: "start_datetime", headerName: "Starts", width: 185, valueFormatter: (value) => formatDateTime(value) },
    { field: "end_datetime", headerName: "Ends", width: 185, valueFormatter: (value) => formatDateTime(value) },
    { field: "location_en", headerName: "Location", flex: 1, minWidth: 180 },
    {
      field: "status",
      headerName: "Status",
      width: 125,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const status = getEventStatus(row);
        return <Chip size="small" label={status.label} color={status.color} variant={status.color === "default" ? "outlined" : "filled"} />;
      },
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
    <List title="Events">
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};

export { getEventStatus };
