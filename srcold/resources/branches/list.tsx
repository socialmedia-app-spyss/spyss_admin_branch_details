import { List, useDataGrid } from "@refinedev/mui";
import { DataGrid } from "@mui/x-data-grid";

export const BranchList = () => {
  const { dataGridProps } = useDataGrid({
    resource: "branches",
  });

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        autoHeight
        columns={[
          { field: "branch_name", headerName: "Branch" },
          { field: "city", headerName: "City" },
          { field: "category", headerName: "Category" },
        ]}
      />
    </List>
  );
};