import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { Notification } from "../../types/notification"; // Assuming you have a Notification type

export const NotificationList = () => {
  const { dataGridProps } = useDataGrid<Notification>({
    resource: "notifications",
  });

  const columns: GridColDef<Notification>[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "message", headerName: "Message", flex: 2 },
    { field: "target_role", headerName: "Target Role", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "created_at", headerName: "Created At", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleString() },
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
