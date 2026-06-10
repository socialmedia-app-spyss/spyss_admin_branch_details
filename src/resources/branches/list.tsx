import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Branch } from "../../types/branch";
import { Stack } from "@mui/material";

export const BranchList = () => {
  const { dataGridProps } = useDataGrid<Branch>({
    resource: "branches",
  });

  const columns: GridColDef<Branch>[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "branch_name", headerName: "Branch Name", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "admin_level_1", headerName: "State", flex: 1 }, // State
    { field: "category", headerName: "Category", flex: 1 },
    { field: "batch", headerName: "Batch", width: 120 },
    { field: "contact_no", headerName: "Contact", flex: 1 },
    {
      field: "is_active",
      headerName: "Active",
      width: 100,
      valueGetter: (_, row) => (row.is_active ? "Yes" : "No"),
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