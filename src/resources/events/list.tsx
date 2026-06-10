import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { Event } from "../../types/event"; // Assuming you have an Event type

export const EventList = () => {
  const { dataGridProps } = useDataGrid<Event>({
    resource: "events",
  });

  const columns: GridColDef<Event>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "event_name",
      headerName: "Event Name",
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
    },
    {
      field: "start_datetime",
      headerName: "Start",
      width: 180,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString()
          : "",
    },
    {
      field: "end_datetime",
      headerName: "End",
      width: 180,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleString()
          : "",
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 100,
      valueGetter: (_, row) =>
        row.is_active ? "Yes" : "No",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 140,
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
    <List>
      <DataGrid
        {...dataGridProps}
        autoHeight
        columns={columns}
      />
    </List>
  );
};