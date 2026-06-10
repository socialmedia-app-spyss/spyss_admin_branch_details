import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { Notification } from "../../types/notification"; // Assuming you have a Notification type

export const NotificationList = () => {
  const { dataGridProps } = useDataGrid<Notification>({
    resource: "notifications",
  });

  const columns: GridColDef<Notification>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "notification_code",
      headerName: "Code",
      width: 140,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "type",
      headerName: "Type",
      width: 140,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 140,
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 100,
      valueGetter: (_, row) =>
        row.is_active ? "Yes" : "No",
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleString() : "",
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