import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Button, Chip, Snackbar, Stack, TextField, Tooltip } from "@mui/material";
import {
  type CrudFilters,
  type HttpError,
  useCreate,
  useGetIdentity,
  useUpdate,
} from "@refinedev/core";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes,
  GridToolbar,
  type GridColDef,
  type GridEventListener,
  type GridPreProcessEditCellProps,
  type GridRenderEditCellParams,
  type GridRowId,
  type GridRowModesModel,
} from "@mui/x-data-grid";
import { DeleteButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { DailyPanchanga, DailyPanchangaInput } from "../../types/panchanga";
import type { UserProfile } from "../../types/user";
import { supabaseClient } from "../../supabaseClient";
import { normalizePanchanga } from "./create";
import { getPanchangaMonthRange, isPanchangaMonth } from "./monthFilter";
import { panchangaOptions } from "./options";

type PanchangaGridRow = DailyPanchanga & { isNew?: boolean };
type OptionField = keyof typeof panchangaOptions;

const optionLabels: Record<OptionField, string> = {
  samvatsara: "ಸಂವತ್ಸರ",
  ayana: "ಆಯನ",
  rutu: "ಋತು",
  masa: "ಮಾಸ",
  paksha: "ಪಕ್ಷ",
  tithi: "ತಿಥಿ",
  vasara: "ವಾಸರ",
  weekday: "ವಾರ",
  nakshatra: "ನಕ್ಷತ್ರ",
  yoga: "ಯೋಗ",
  karana: "ಕರಣ",
};

const editableInput = (row: PanchangaGridRow): DailyPanchangaInput =>
  normalizePanchanga({
    language: row.language || "kn",
    panchanga_date: row.panchanga_date,
    krishna_shaka_year: row.krishna_shaka_year,
    shalivahana_shaka_year: row.shalivahana_shaka_year,
    kali_yuga_year: row.kali_yuga_year,
    samvatsara: row.samvatsara,
    ayana: row.ayana,
    rutu: row.rutu,
    masa: row.masa,
    paksha: row.paksha,
    tithi: row.tithi,
    vasara: row.vasara,
    weekday: row.weekday,
    nakshatra: row.nakshatra,
    yoga: row.yoga,
    karana: row.karana,
    display_date: row.display_date,
    special_note: row.special_note,
    special_note2: row.special_note2,
    special_note3: row.special_note3,
    approve_status: row.approve_status ?? false,
    image_url: row.image_url,
    image_storage_path: row.image_storage_path,
    image_template_id: row.image_template_id,
  });

const emptyPanchangaRow = (id: string): PanchangaGridRow => ({
  id,
  isNew: true,
  language: "kn",
  panchanga_date: "",
  date_index: 0,
  krishna_shaka_year: null,
  shalivahana_shaka_year: null,
  kali_yuga_year: null,
  samvatsara: "",
  ayana: "",
  rutu: "",
  masa: "",
  paksha: "",
  tithi: "",
  vasara: "",
  weekday: "",
  nakshatra: "",
  yoga: "",
  karana: "",
  display_date: "",
  special_note: "",
  special_note2: "",
  special_note3: "",
  approve_status: false,
  created_at: "",
  updated_at: "",
});

const DateEditCell = (params: GridRenderEditCellParams<PanchangaGridRow>) => (
  <TextField
    type="date"
    value={params.value ?? ""}
    onChange={(event) =>
      params.api.setEditCellValue({
        id: params.id,
        field: params.field,
        value: event.target.value,
      })
    }
    fullWidth
    size="small"
    required
    error={Boolean(params.error)}
    helperText={params.error ? String(params.validationMessage ?? "Invalid date.") : undefined}
  />
);

const krishnaShakaYears = Array.from({ length: 6 }, (_, index) => 5128 + index);
const shalivahanaShakaYears = Array.from({ length: 6 }, (_, index) => 1949 + index);
const kaliYugaYears = Array.from({ length: 6 }, (_, index) => 28 + index);

export const PanchangaList = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const { mutateAsync: createPanchanga } = useCreate<
    DailyPanchanga,
    HttpError,
    DailyPanchangaInput
  >();
  const { mutateAsync: updatePanchanga } = useUpdate<
    DailyPanchanga,
    HttpError,
    DailyPanchangaInput
  >();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newRows, setNewRows] = useState<PanchangaGridRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const monthParam = searchParams.get("month");
  const selectedMonth = isPanchangaMonth(monthParam) ? monthParam : "";
  const monthRange = selectedMonth ? getPanchangaMonthRange(selectedMonth) : null;
  const monthFilters: CrudFilters = monthRange
    ? [
        { field: "panchanga_date", operator: "gte", value: monthRange.start },
        { field: "panchanga_date", operator: "lt", value: monthRange.nextMonth },
      ]
    : [];
  const { dataGridProps } = useDataGrid<DailyPanchanga>({
    resource: "daily_panchanga",
    sorters: { initial: [{ field: "panchanga_date", order: "desc" }] },
    filters: { permanent: monthFilters },
  });

  const updateMonth = (month: string) => {
    setSearchParams(month ? { month } : {});
  };

  const startCreate = () => {
    const id = `new-${crypto.randomUUID()}`;
    setSaveError("");
    setValidationError("");
    setNewRows((rows) => [emptyPanchangaRow(id), ...rows]);
    setRowModesModel((model) => ({
      ...model,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "panchanga_date" },
    }));
  };

  const startEdit = (id: GridRowId) => {
    setSaveError("");
    setValidationError("");
    setRowModesModel((model) => ({
      ...model,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const saveRow = (id: GridRowId) => {
    if (validationError) {
      return;
    }
    setRowModesModel((model) => ({
      ...model,
      [id]: { mode: GridRowModes.View },
    }));
  };

  const cancelEdit = (id: GridRowId, isNew?: boolean) => {
    setSaveError("");
    setValidationError("");
    setRowModesModel((model) => ({
      ...model,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
    if (isNew) {
      setNewRows((rows) => rows.filter((row) => row.id !== id));
    }
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = async (newRow: PanchangaGridRow) => {
    setSaveError("");
    const values = editableInput(newRow);

    if (newRow.isNew) {
      const response = await createPanchanga({
        resource: "daily_panchanga",
        values,
      });
      setNewRows((rows) => rows.filter((row) => row.id !== newRow.id));
      return response.data as PanchangaGridRow;
    }

    const response = await updatePanchanga({
      resource: "daily_panchanga",
      id: newRow.id,
      values,
    });
    return response.data as PanchangaGridRow;
  };

  const validateDateLanguage = async (
    params: GridPreProcessEditCellProps<unknown, PanchangaGridRow>,
    changedField: "panchanga_date" | "language",
  ) => {
    if (params.hasChanged === false) {
      return params.props;
    }

    const date =
      changedField === "panchanga_date"
        ? String(params.props.value ?? "")
        : String(
            params.otherFieldsProps?.panchanga_date?.value ??
              params.row.panchanga_date ??
              "",
          );
    const language =
      changedField === "language"
        ? String(params.props.value ?? "")
        : String(params.otherFieldsProps?.language?.value ?? params.row.language ?? "");

    if (!date || !language) {
      setValidationError("");
      return { ...params.props, error: false };
    }

    let duplicateQuery = supabaseClient
      .from("daily_panchanga")
      .select("id")
      .eq("panchanga_date", date)
      .eq("language", language);

    if (!String(params.id).startsWith("new-")) {
      duplicateQuery = duplicateQuery.neq("id", String(params.id));
    }

    const { data, error } = await duplicateQuery.limit(1);
    if (error) {
      setValidationError(`Unable to validate Date and Language: ${error.message}`);
      return {
        ...params.props,
        error: true,
        validationMessage: error.message,
      };
    }

    const isDuplicate = Boolean(data?.length);
    setValidationError(
      isDuplicate
        ? `A Panchanga entry already exists for ${date} in language "${language}". Please select a different date or language.`
        : "",
    );
    return {
      ...params.props,
      error: isDuplicate,
      validationMessage: isDuplicate
        ? "This date and language combination already exists."
        : undefined,
    };
  };

  const optionColumns = (Object.keys(panchangaOptions) as OptionField[]).map(
    (field): GridColDef<PanchangaGridRow> => ({
      field,
      headerName: optionLabels[field],
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: [...panchangaOptions[field]],
    }),
  );

  const columns: GridColDef<PanchangaGridRow>[] = [
    {
      field: "panchanga_date",
      headerName: "Date",
      width: 145,
      editable: true,
      renderEditCell: DateEditCell,
      preProcessEditCellProps: (params) =>
        validateDateLanguage(params, "panchanga_date"),
    },
    {
      field: "language",
      headerName: "Language",
      width: 100,
      editable: true,
      type: "singleSelect",
      valueOptions: ["kn"],
      preProcessEditCellProps: (params) => validateDateLanguage(params, "language"),
    },
    {
      field: "krishna_shaka_year",
      headerName: "Krishna Shaka Year",
      width: 175,
      editable: true,
      type: "singleSelect",
      valueOptions: krishnaShakaYears,
    },
    {
      field: "shalivahana_shaka_year",
      headerName: "Shalivahana Shaka Year",
      width: 200,
      editable: true,
      type: "singleSelect",
      valueOptions: shalivahanaShakaYears,
    },
    {
      field: "kali_yuga_year",
      headerName: "Kali Yuga Year",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: kaliYugaYears,
    },
    ...optionColumns,
    { field: "display_date", headerName: "Display Date", width: 220, editable: true },
    { field: "special_note", headerName: "Special Note 1", width: 220, editable: true },
    { field: "special_note2", headerName: "Special Note 2", width: 220, editable: true },
    { field: "special_note3", headerName: "Special Note 3", width: 220, editable: true },
    {
      field: "approve_status",
      headerName: "Status",
      width: 145,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: true, label: "Approved" },
        { value: false, label: "Not Approved" },
      ],
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={value ? "success" : "default"}
          label={value ? "Approved" : "Not Approved"}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      filterable: false,
      hideable: false,
      getActions: ({ id, row }) => {
        const isEditing = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isEditing) {
          return [
            <GridActionsCellItem
              key="save"
              icon={
                <Tooltip title="Save">
                  <SaveIcon />
                </Tooltip>
              }
              label="Save"
              onClick={() => saveRow(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={
                <Tooltip title="Cancel">
                  <CancelIcon />
                </Tooltip>
              }
              label="Cancel"
              onClick={() => cancelEdit(id, row.isNew)}
            />,
          ];
        }

        return [
          <ShowButton key="show" hideText recordItemId={id} />,
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit inline">
                <EditIcon />
              </Tooltip>
            }
            label="Edit"
            onClick={() => startEdit(id)}
          />,
          ...(identity?.role === "SUPER_ADMIN"
            ? [<DeleteButton key="delete" hideText recordItemId={id} />]
            : []),
        ];
      },
    },
  ];

  return (
    <List title="Daily Panchanga" canCreate={false}>
      <Stack spacing={1.5} mb={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
        >
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
            Create row
          </Button>
        </Stack>
        {saveError && <Alert severity="error">{saveError}</Alert>}
      </Stack>
      <Snackbar
        open={Boolean(validationError)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          {validationError}
        </Alert>
      </Snackbar>
      <DataGrid
        {...dataGridProps}
        rows={[...newRows, ...dataGridProps.rows] as PanchangaGridRow[]}
        rowCount={(dataGridProps.rowCount ?? 0) + newRows.length}
        columns={columns}
        autoHeight
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        getRowHeight={({ id }) =>
          rowModesModel[id]?.mode === GridRowModes.Edit ? "auto" : null
        }
        getEstimatedRowHeight={() => 84}
        onProcessRowUpdateError={(error) => {
          setSaveError(error instanceof Error ? error.message : "Unable to save this Panchanga row.");
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            csvOptions: { disableToolbarButton: true },
            printOptions: { disableToolbarButton: true },
          },
        }}
      />
    </List>
  );
};
