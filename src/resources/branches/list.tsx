import { useGetIdentity } from "@refinedev/core";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { Chip, Stack } from "@mui/material";
import { DataGrid, GridToolbar, type GridColDef } from "@mui/x-data-grid";
import type { BranchWithMasters } from "../../types/branch";
import type { UserProfile } from "../../types/user";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedJson } from "../../utils/i18n";
import { NO_VALAYA_ACCESS_ID } from "../../services/valayaScope";

export const BranchList = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { language } = useLanguage();

  const isSuperAdmin = identity?.role === "SUPER_ADMIN";
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds =
    identity?.accessible_valaya_ids && identity.accessible_valaya_ids.length > 0
      ? identity.accessible_valaya_ids
      : identity?.valaya_id
        ? [identity.valaya_id]
        : [];

  const valayaAccessFilters = isValayaAdmin
    ? accessibleValayaIds.length > 0
      ? [{ field: "valaya_id", operator: "in" as const, value: accessibleValayaIds }]
      : [{ field: "valaya_id", operator: "eq" as const, value: NO_VALAYA_ACCESS_ID }]
    : [];

  const { dataGridProps } = useDataGrid<BranchWithMasters>({
    resource: "app_branches",
    filters: { permanent: valayaAccessFilters },
    meta: {
      select: [
        "*",
        "master_categories(category_name)",
        "master_batches(batch_name)",
        "master_countries!app_branches_country_id_fkey(country_name)",
        "master_states!fk_branch_country_state(state_name)",
        "master_districts!fk_branch_state_district(district_name)",
        "master_valayas!app_branches_valaya_id_fkey(valaya_name)",
        "master_regions!fk_branch_district_region(region_name)",
        "master_branch_statuses!app_branches_status_id_fkey(status_name)",
        "master_mediums!app_branches_medium_id_fkey(medium_name)",
      ].join(", "),
    },
  });

  const columns: GridColDef<BranchWithMasters>[] = [
    { field: "branch_code", headerName: "Branch Code", width: 150 },
    {
      // DataGrid forwards quick filters to PostgREST. `branch_name` is JSONB,
      // which PostgreSQL cannot compare with ILIKE; use its generated text
      // search column while continuing to render the localized JSON value.
      field: "branch_name_en_sort",
      headerName: "Branch Name",
      flex: 1,
      minWidth: 220,
      valueGetter: (_, row) => getLocalizedJson(row.branch_name, language) || "—",
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 110,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          color={value ? "success" : "default"}
        />
      ),
    },
    {
      field: "nagara",
      headerName: "Nagara",
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getLocalizedJson(row.nagara, language) || "—",
    },
    {
      field: "upa_nagara",
      headerName: "Upa Nagara",
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getLocalizedJson(row.upa_nagara, language) || "—",
    },
    {
      field: "master_countries",
      headerName: "Country",
      minWidth: 130,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_countries?.country_name, language) || "—",
    },
    {
      field: "master_states",
      headerName: "State",
      minWidth: 140,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_states?.state_name, language) || "—",
    },
    {
      field: "master_districts",
      headerName: "District",
      minWidth: 150,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_districts?.district_name, language) || "—",
    },
    {
      field: "master_valayas",
      headerName: "Valaya",
      minWidth: 150,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_valayas?.valaya_name, language) || "—",
    },
    {
      field: "master_regions",
      headerName: "Region (Zone)",
      minWidth: 150,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_regions?.region_name, language) || "—",
    },
    {
      field: "master_categories",
      headerName: "Category",
      minWidth: 130,
      flex: 1,
      valueGetter: (_, row) => getLocalizedJson(row.master_categories?.category_name, language) || "—",
    },
    {
      field: "master_batches",
      headerName: "Batch",
      width: 120,
      valueGetter: (_, row) => getLocalizedJson(row.master_batches?.batch_name, language) || "—",
    },
    {
      field: "class_timings",
      headerName: "Class Timings",
      minWidth: 160,
      flex: 1,
      valueGetter: (_, row) => row.class_timings || "—",
    },
    { field: "contact_number", headerName: "Contact", width: 140 },
    {
      field: "master_branch_statuses",
      headerName: "Status",
      width: 120,
      valueGetter: (_, row) => getLocalizedJson(row.master_branch_statuses?.status_name, language) || "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 140,
      sortable: false,
      renderCell: ({ row }) => {
        const canAccessRow =
          !isValayaAdmin ||
          !row.valaya_id ||
          accessibleValayaIds.includes(row.valaya_id);

        if (!canAccessRow) {
          return null;
        }

        return (
          <Stack direction="row" spacing={1}>
            <ShowButton hideText size="small" recordItemId={row.id} />
            <EditButton hideText size="small" recordItemId={row.id} />
            {isSuperAdmin && (
              <DeleteButton hideText size="small" recordItemId={row.id} />
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <List
      resource="app_branches"
      canCreate={true}
      createButtonProps={{ accessControl: { enabled: false } }}
    >
      <DataGrid
        {...dataGridProps}
        columns={columns}
        autoHeight
        density="compact"
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </List>
  );
};
