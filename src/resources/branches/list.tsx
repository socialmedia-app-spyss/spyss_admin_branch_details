import { useGetIdentity } from "@refinedev/core";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { Stack } from "@mui/material";
import { DataGrid, GridToolbar, type GridColDef } from "@mui/x-data-grid";
import type { BranchWithMasters } from "../../types/branch";
import type { UserProfile } from "../../types/user";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedName } from "../../utils/i18n";

const optionalLocalizedValue = (
  english: string | null | undefined,
  kannada: string | null | undefined,
  language: "en" | "kn",
) => getLocalizedName(english, kannada, language) || "—";

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
    { field: "branch_code", headerName: "Branch Code", width: 160 },
    {
      field: "branch_name_en",
      headerName: "Branch Name",
      flex: 1,
      minWidth: 220,
      valueGetter: (_, row) => getLocalizedName(row.branch_name_en, row.branch_name_kn, language),
    },
    {
      field: "nagara_en",
      headerName: "Nagara",
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => optionalLocalizedValue(row.nagara_en, row.nagara_kn, language),
    },
    {
      field: "upa_nagara_en",
      headerName: "Upa Nagara",
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => optionalLocalizedValue(row.upa_nagara_en, row.upa_nagara_kn, language),
    },
    {
      field: "master_countries",
      headerName: "Country",
      minWidth: 140,
      flex: 1,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_countries?.country_name_en,
        row.master_countries?.country_name_kn,
        language,
      ),
    },
    {
      field: "master_states",
      headerName: "State",
      minWidth: 150,
      flex: 1,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_states?.state_name_en,
        row.master_states?.state_name_kn,
        language,
      ),
    },
    {
      field: "master_districts",
      headerName: "District",
      minWidth: 160,
      flex: 1,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_districts?.district_name_en,
        row.master_districts?.district_name_kn,
        language,
      ),
    },
    {
      field: "master_valayas",
      headerName: "Valaya",
      minWidth: 160,
      flex: 1,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_valayas?.valaya_name_en,
        row.master_valayas?.valaya_name_kn,
        language,
      ),
    },
    {
      field: "master_categories",
      headerName: "Category",
      minWidth: 140,
      flex: 1,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_categories?.category_name_en,
        row.master_categories?.category_name_kn,
        language,
      ),
    },
    {
      field: "master_batches",
      headerName: "Batch",
      width: 130,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_batches?.batch_name_en,
        row.master_batches?.batch_name_kn,
        language,
      ),
    },
    { field: "contact_number", headerName: "Contact", width: 150 },
    {
      field: "master_branch_statuses",
      headerName: "Status",
      width: 130,
      valueGetter: (_, row) => optionalLocalizedValue(
        row.master_branch_statuses?.status_name_en,
        row.master_branch_statuses?.status_name_kn,
        language,
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 140,
      sortable: false,
      filterable: false,
      hideable: false,
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
      <DataGrid
        {...dataGridProps}
        autoHeight
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            csvOptions: { disableToolbarButton: true },
            printOptions: { disableToolbarButton: true },
          },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              master_countries: false,
              master_states: false,
              master_districts: false,
              master_valayas: false,
              master_categories: false,
              master_batches: false,
              contact_number: false,
              master_branch_statuses: false,
            },
          },
        }}
      />
    </List>
  );
};
