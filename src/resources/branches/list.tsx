import { List, useDataGrid, EditButton, DeleteButton, ShowButton } from "@refinedev/mui";
import { useGetIdentity } from "@refinedev/core";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { BranchWithMasters } from "../../types/branch";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedName } from "../../utils/i18n";
import type { UserProfile } from "../../types/user";

export const BranchList = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { language } = useLanguage();

  const isSuperAdmin = identity?.role === "SUPER_ADMIN";
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];

  const valayaAccessFilters = isValayaAdmin
    ? accessibleValayaIds.length > 0
      ? [{ field: "valaya_id", operator: "in" as const, value: accessibleValayaIds }]
      : [{ field: "valaya_id", operator: "eq" as const, value: "__no_valaya_access__" }]
    : [];

  const { dataGridProps } = useDataGrid<BranchWithMasters>({
    resource: "latest_branches",
    filters: { permanent: valayaAccessFilters },
    meta: {
      select: [
        "*",
        "master_categories(category_name_en, category_name_kn)",
        "master_batches(batch_name_en, batch_name_kn)",
        "master_countries(country_name_en, country_name_kn)",
        "master_states(state_name_en, state_name_kn)",
        "master_districts(district_name_en, district_name_kn)",
        "master_valayas(valaya_name_en, valaya_name_kn)",
        "master_branch_statuses(status_name_en, status_name_kn)",
      ].join(", "),
    },
  });

  const columns: GridColDef<BranchWithMasters>[] = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "branch_name_en",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (_, row) => getLocalizedName(row.branch_name_en, row.branch_name_kn, language),
    },
    {
      field: "master_countries",
      headerName: "Country",
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_countries?.country_name_en, row.master_countries?.country_name_kn, language),
    },
    {
      field: "master_states",
      headerName: "State",
      flex: 1,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_states?.state_name_en, row.master_states?.state_name_kn, language),
    },
    {
      field: "master_valayas",
      headerName: "Valaya",
      flex: 1,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_valayas?.valaya_name_en, row.master_valayas?.valaya_name_kn, language),
    },
    {
      field: "master_districts",
      headerName: "District",
      flex: 1,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_districts?.district_name_en, row.master_districts?.district_name_kn, language),
    },
    {
      field: "master_categories",
      headerName: "Category",
      flex: 1,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_categories?.category_name_en, row.master_categories?.category_name_kn, language),
    },
    {
      field: "master_batches",
      headerName: "Batch",
      width: 120,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_batches?.batch_name_en, row.master_batches?.batch_name_kn, language),
    },
    { field: "contact_number", headerName: "Contact", flex: 1 },
    {
      field: "master_branch_statuses",
      headerName: "Status",
      width: 120,
      valueGetter: (_, row) =>
        getLocalizedName(row.master_branch_statuses?.status_name_en, row.master_branch_statuses?.status_name_kn, language),
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
          {isSuperAdmin && <DeleteButton hideText recordItemId={row.id} />}
        </Stack>
      ),
    },
  ];

  return (
    <List>
      <DataGrid {...dataGridProps} autoHeight columns={columns} />
    </List>
  );
};
