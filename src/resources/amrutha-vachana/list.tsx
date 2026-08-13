import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Button, Chip, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import {
  type CrudFilters,
  type HttpError,
  useCreate,
  useGetIdentity,
  useList,
  useUpdate,
} from "@refinedev/core";
import {
  DataGrid,
  GridRowEditStopReasons,
  GridRowModes,
  GridToolbar,
  type GridColDef,
  type GridEventListener,
  type GridRenderEditCellParams,
  type GridRowId,
  type GridRowModesModel,
} from "@mui/x-data-grid";
import { DeleteButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  AmruthaVachanaAuthor,
  AmruthaVachanaAuthorTranslation,
  DailyAmruthaVachana,
  DailyAmruthaVachanaInput,
} from "../../types/amruthaVachana";
import type { UserProfile } from "../../types/user";
import { getMonthFilterRange, isMonthFilter } from "../../utils/monthFilter";

type GridRow = DailyAmruthaVachana & { isNew?: boolean };

const emptyRow = (id: string): GridRow => ({
  id,
  isNew: true,
  language: "kn",
  vachana_date: "",
  date_index: 0,
  author_id: "",
  vachana_text: "",
  title: "",
  attribution_override: "",
  sequence_number: null,
  template_code: "AMRUTHA_VACHANA_V1",
  canvas_width: 1080,
  canvas_height: 1440,
  text_alignment: "left",
  font_family: null,
  font_size: null,
  minimum_font_size: 38,
  line_spacing: null,
  maximum_lines: 7,
  text_color: "#283593",
  attribution_color: "#F15A24",
  approve_status: false,
  is_active: true,
  created_at: "",
  updated_at: "",
  image_generation_status: "PENDING",
  image_version: 1,
  generation_attempts: 0,
});

const editableValues = (row: GridRow): DailyAmruthaVachanaInput => ({
  language: row.language.trim().toLowerCase() || "kn",
  vachana_date: row.vachana_date,
  author_id: row.author_id,
  vachana_text: row.vachana_text.trim(),
  title: row.title?.trim() || null,
  attribution_override: row.attribution_override?.trim() || null,
  sequence_number: row.sequence_number ?? null,
  template_code: row.template_code || "AMRUTHA_VACHANA_V1",
  canvas_width: row.canvas_width || 1080,
  canvas_height: row.canvas_height || 1440,
  text_alignment: row.text_alignment || "left",
  font_family: row.font_family?.trim() || null,
  font_size: row.font_size ?? null,
  minimum_font_size: row.minimum_font_size || 38,
  line_spacing: row.line_spacing ?? null,
  maximum_lines: row.maximum_lines || 7,
  text_color: row.text_color || "#283593",
  attribution_color: row.attribution_color || "#F15A24",
  approve_status: row.approve_status ?? false,
  is_active: row.is_active ?? true,
});

const dateEditCell = (params: GridRenderEditCellParams<GridRow>) => (
  <TextField
    type="date"
    value={params.value ?? ""}
    onChange={(event) =>
      void params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value })
    }
    fullWidth
    size="small"
  />
);

const textEditCell = (params: GridRenderEditCellParams<GridRow>) => (
  <TextField
    value={params.value ?? ""}
    onChange={(event) =>
      void params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value })
    }
    multiline
    minRows={3}
    fullWidth
    size="small"
  />
);

export const AmruthaVachanaList = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam = searchParams.get("month");
  const selectedMonth = isMonthFilter(monthParam) ? monthParam : "";
  const monthRange = selectedMonth ? getMonthFilterRange(selectedMonth) : null;
  const monthFilters: CrudFilters = monthRange
    ? [
        { field: "vachana_date", operator: "gte", value: monthRange.start },
        { field: "vachana_date", operator: "lt", value: monthRange.nextMonth },
      ]
    : [];
  const { dataGridProps } = useDataGrid<DailyAmruthaVachana>({
    resource: "daily_amrutha_vachana",
    sorters: { initial: [{ field: "vachana_date", order: "desc" }] },
    filters: { permanent: monthFilters },
  });
  const authors = useList<AmruthaVachanaAuthor>({
    resource: "amrutha_vachana_authors",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "display_order", order: "asc" }],
  });
  const authorTranslations = useList<AmruthaVachanaAuthorTranslation>({
    resource: "amrutha_vachana_author_translations",
    pagination: { mode: "off" },
    filters: [{ field: "language", operator: "eq", value: "kn" }],
  });
  const { mutateAsync: createRecord } = useCreate<
    DailyAmruthaVachana,
    HttpError,
    DailyAmruthaVachanaInput
  >();
  const { mutateAsync: updateRecord } = useUpdate<
    DailyAmruthaVachana,
    HttpError,
    DailyAmruthaVachanaInput
  >();
  const [newRows, setNewRows] = useState<GridRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [saveError, setSaveError] = useState("");

  const updateMonth = (month: string) => {
    setSearchParams(month ? { month } : {});
  };

  const authorOptions = useMemo(
    () => {
      const names = new Map(
        (authorTranslations.result?.data ?? []).map((translation) => [
          translation.author_id,
          translation.author_name,
        ]),
      );
      return (authors.result?.data ?? []).map((author) => ({
        value: author.id,
        label: names.get(author.id) || author.author_code,
      }));
    },
    [authors.result?.data, authorTranslations.result?.data],
  );

  const startCreate = () => {
    const id = `new-${crypto.randomUUID()}`;
    setNewRows((rows) => [emptyRow(id), ...rows]);
    setRowModesModel((model) => ({
      ...model,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "vachana_date" },
    }));
  };

  const processRowUpdate = async (row: GridRow) => {
    setSaveError("");
    if (!row.vachana_date || !row.author_id || !row.vachana_text.trim()) {
      throw new Error("Date, author, and Vachana text are required.");
    }
    const values = editableValues(row);
    if (row.isNew) {
      const response = await createRecord({ resource: "daily_amrutha_vachana", values });
      setNewRows((rows) => rows.filter((item) => item.id !== row.id));
      return response.data as GridRow;
    }
    const response = await updateRecord({
      resource: "daily_amrutha_vachana",
      id: row.id,
      values,
    });
    return response.data as GridRow;
  };

  const columns: GridColDef<GridRow>[] = [
    { field: "vachana_date", headerName: "Date", width: 135, editable: true, renderEditCell: dateEditCell },
    { field: "language", headerName: "Language", width: 100, editable: true },
    {
      field: "author_id",
      headerName: "Author",
      width: 220,
      editable: true,
      type: "singleSelect",
      valueOptions: authorOptions,
      valueFormatter: (value) => authorOptions.find((option) => option.value === value)?.label || value,
    },
    {
      field: "vachana_text",
      headerName: "Vachana",
      width: 420,
      editable: true,
      renderEditCell: textEditCell,
    },
    { field: "title", headerName: "Title", width: 180, editable: true },
    { field: "attribution_override", headerName: "Attribution Override", width: 220, editable: true },
    {
      field: "approve_status",
      headerName: "Approval",
      width: 135,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: true, label: "Approved" },
        { value: false, label: "Not Approved" },
      ],
      renderCell: ({ value }) => (
        <Chip size="small" color={value ? "success" : "default"} label={value ? "Approved" : "Not Approved"} />
      ),
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 105,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
      ],
      renderCell: ({ value }) => <Chip size="small" color={value ? "success" : "default"} label={value ? "Active" : "Inactive"} />,
    },
    {
      field: "image_generation_status",
      headerName: "Image",
      width: 125,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={value === "COMPLETED" ? "success" : value === "FAILED" ? "error" : "default"}
          label={value}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 175,
      sortable: false,
      filterable: false,
      renderCell: ({ id, row }) => {
        const editing = rowModesModel[id]?.mode === GridRowModes.Edit;
        return editing ? (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Save">
              <IconButton
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  setRowModesModel((model) => ({ ...model, [id]: { mode: GridRowModes.View } }));
                }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setRowModesModel((model) => ({
                    ...model,
                    [id]: { mode: GridRowModes.View, ignoreModifications: true },
                  }));
                  if (row.isNew) setNewRows((rows) => rows.filter((item) => item.id !== id));
                }}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.5}>
            <ShowButton hideText recordItemId={id} />
            <Tooltip title="Edit inline">
              <IconButton
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  setRowModesModel((model) => ({ ...model, [id]: { mode: GridRowModes.Edit } }));
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            {identity?.role === "SUPER_ADMIN" && <DeleteButton hideText recordItemId={id} />}
          </Stack>
        );
      },
    },
  ];

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) event.defaultMuiPrevented = true;
  };

  return (
    <List title="Daily Amrutha Vachana" canCreate={false}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            type="month"
            label="Filter by month"
            value={selectedMonth}
            onChange={(event) => updateMonth(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />
          <Button variant="outlined" onClick={() => updateMonth("")} disabled={!selectedMonth}>
            Clear filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={startCreate}>
            Add Amrutha Vachana
          </Button>
        </Stack>
        {saveError && <Alert severity="error">{saveError}</Alert>}
        <DataGrid
          {...dataGridProps}
          rows={[...newRows, ...(dataGridProps.rows as GridRow[])]}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) =>
            setSaveError(error instanceof Error ? error.message : "Unable to save this record.")
          }
          getRowHeight={() => "auto"}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          sx={{ minHeight: 560, "& .MuiDataGrid-cell": { py: 1 } }}
        />
      </Stack>
    </List>
  );
};
