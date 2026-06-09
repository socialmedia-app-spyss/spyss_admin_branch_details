import React from "react";
import {
  List,
  useDataGrid,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom"; // Import Link

export const BranchList: React.FC = () => {
  const { dataGridProps } = useDataGrid({
    resource: "branches",
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "branch_name",
          order: "asc",
        },
      ],
    },
  });

  const columns = React.useMemo<GridColDef<any>[]>(
    () => [
      { field: "id", headerName: "ID", width: 90 },
      { field: "branch_name", headerName: "Branch Name", minWidth: 150 },
      { field: "address", headerName: "Address", minWidth: 200 },
      { field: "contact_no", headerName: "Contact No", minWidth: 120 },
      { field: "category", headerName: "Category", minWidth: 100 },
      { field: "batch", headerName: "Batch", minWidth: 100 },
      { field: "mukhyashikshak_name", headerName: "Mukhyashikshak Name", minWidth: 180 },
      { field: "class_timings", headerName: "Class Timings", minWidth: 150 },
      { field: "country_code_or_name", headerName: "Country", minWidth: 120 },
      { field: "admin_level_1", headerName: "State", minWidth: 120 },
      { field: "city", headerName: "City", minWidth: 120 },
      { field: "admin_level_3", headerName: "Area", minWidth: 120 },
      { field: "latitude", headerName: "Latitude", type: "number", minWidth: 100 },
      { field: "longitude", headerName: "Longitude", type: "number", minWidth: 100 },
      { field: "is_active", headerName: "Active", type: "boolean", minWidth: 90 },
      {
        field: "created_at",
        headerName: "Created At",
        type: "dateTime",
        minWidth: 180,
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        type: "dateTime",
        minWidth: 180,
        valueFormatter: (params) => new Date(params.value).toLocaleString(),
      },
      {
        field: "actions",
        headerName: "Actions",
        type: "actions",
        getActions: ({ row }) => [
          <ShowButton hideText recordItemId={row.id} />,
          <EditButton hideText recordItemId={row.id} />,
          <DeleteButton hideText recordItemId={row.id} />,
        ],
        minWidth: 150,
      },
    ],
    []
  );

  return (
    <List
      headerButtons={
        <>
          <CreateButton />
          <Link to="/branches/create">Test Link to Create</Link>
        </>
      }
    >
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};