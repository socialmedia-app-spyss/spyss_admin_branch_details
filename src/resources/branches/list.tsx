import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui"; // Import EditButton, DeleteButton, and ShowButton
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Branch } from "../../types/branch"; // Import the Branch type
import { Stack } from "@mui/material"; // Import Stack for button layout

export const BranchList = () => {
  const { dataGridProps } = useDataGrid<Branch>({ // Use the Branch type
    resource: "branches",
  });

  const columns: GridColDef<Branch>[] = [ // Define columns with Branch type
    { field: "id", headerName: "ID", width: 80 },
    { field: "branch_name", headerName: "Branch Name", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "contact_no", headerName: "Contact", flex: 1 },
    { field: "is_active", headerName: "Active", type: "boolean" },
    { field: "country_code_or_name", headerName: "Country", flex: 1 },
    { field: "admin_level_1", headerName: "State", flex: 1 },
    { field: "admin_level_3", headerName: "Area", flex: 1 },
    { field: "mukhyashikshak_name", headerName: "Mukhyashikshak", flex: 1 },
    { field: "class_timings", headerName: "Class Timings", flex: 1 },
    { field: "batch", headerName: "Batch", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: function render({ row }) {
        return (
          <Stack direction="row" spacing={1}>
            <ShowButton hideText recordItemId={row.id} /> {/* Added ShowButton */}
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