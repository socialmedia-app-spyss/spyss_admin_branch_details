import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BranchWithMasters } from "../../types/branch";
import { Stack } from "@mui/material";

export const BranchList = () => {
  const { dataGridProps } = useDataGrid<BranchWithMasters>({
    resource: "latest_branches",
    meta: {
      select:
        "*, master_categories(category_name), master_batches(batch_name), master_states(state_name), master_districts(district_name), master_valayas(valaya_name), master_branch_statuses(status_name)",
    },
  });

  const columns: GridColDef<BranchWithMasters>[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "branch_name", headerName: "Branch Name", flex: 1 },
    {
      field: "master_states",
      headerName: "State",
      flex: 1,
      valueGetter: (_, row) => row.master_states?.state_name ?? "",
    },
    {
      field: "master_districts",
      headerName: "District",
      flex: 1,
      valueGetter: (_, row) => row.master_districts?.district_name ?? "",
    },
    {
      field: "master_valayas",
      headerName: "Valaya",
      flex: 1,
      valueGetter: (_, row) => row.master_valayas?.valaya_name ?? "",
    },
    {
      field: "master_categories",
      headerName: "Category",
      flex: 1,
      valueGetter: (_, row) => row.master_categories?.category_name ?? "",
    },
    {
      field: "master_batches",
      headerName: "Batch",
      width: 120,
      valueGetter: (_, row) => row.master_batches?.batch_name ?? "",
    },
    { field: "contact_number", headerName: "Contact", flex: 1 },
    {
      field: "master_branch_statuses",
      headerName: "Status",
      width: 120,
      valueGetter: (_, row) => row.master_branch_statuses?.status_name ?? "",
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
