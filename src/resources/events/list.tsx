import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { Event } from "../../types/event"; // Assuming you have an Event type

export const EventList = () => {
  const { dataGridProps } = useDataGrid<Event>({
    resource: "events",
  });

  const columns: GridColDef<Event>[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Event Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    // { field: "start_date", headerName: "Start Date", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    // { field: "end_date", headerName: "End Date", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: function render({ row }) {
        return (
          <Stack direction="row" spacing={1}>
            <ShowButton hideText recordItemId={row.id} />
            <EditButton hideText recordItemId={row.id} />
            <DeleteButton hideText recordItemId={row.id} />
          </Stack>
        );
      },
      align: "center",
      headerAlign: "center",
      minWidth: 120,
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
