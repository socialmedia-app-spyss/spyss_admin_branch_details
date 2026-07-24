import { Button, Chip, Stack, TextField } from "@mui/material";
import { type CrudFilters, useGetIdentity } from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from "@refinedev/mui";
import { useSearchParams } from "react-router-dom";
import type { DailyPanchanga } from "../../types/panchanga";
import type { UserProfile } from "../../types/user";
import { getPanchangaMonthRange, isPanchangaMonth } from "./monthFilter";

export const PanchangaList = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const columns: GridColDef<DailyPanchanga>[] = [
    { field: "panchanga_date", headerName: "Date", width: 125 },
    { field: "samvatsara", headerName: "ಸಂವತ್ಸರ", width: 140 },
    { field: "masa", headerName: "ಮಾಸ", width: 120 },
    { field: "paksha", headerName: "ಪಕ್ಷ", width: 110 },
    { field: "tithi", headerName: "ತಿಥಿ", width: 130 },
    { field: "nakshatra", headerName: "ನಕ್ಷತ್ರ", width: 140 },
    {
      field: "approve_status",
      headerName: "Status",
      width: 110,
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
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText recordItemId={row.id} />
          <EditButton hideText recordItemId={row.id} />
          {identity?.role === "SUPER_ADMIN" && <DeleteButton hideText recordItemId={row.id} />}
        </Stack>
      ),
    },
  ];

  return (
    <List title="Daily Panchanga">
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems={{ sm: "center" }}>
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
      </Stack>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};
