import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";
import type { ApiResourceStat } from "./types";
import { formatIst } from "./utils";

const n = (value: unknown) => Number(value ?? 0).toLocaleString();
export const ApiStatsDetailsTable = ({ rows, onSelect }: { rows: ApiResourceStat[]; onSelect: (row: ApiResourceStat) => void }) => {
  const columns: GridColDef[] = [
    { field: "resource", headerName: "Resource", width: 180 }, { field: "method", headerName: "Method", width: 90 },
    { field: "normalized_path", headerName: "Normalized API path", width: 260 },
    ...[["total_requests","Total"],["success_2xx","2xx"],["redirect_3xx","3xx"],["client_error_4xx","4xx"],["server_error_5xx","5xx"]].map(([field, headerName]) => ({ field, headerName, width: 100, type: "number" as const, valueFormatter: n })),
    ...[["avg_response_ms","Avg ms"],["p50_response_ms","P50 ms"],["p95_response_ms","P95 ms"],["max_response_ms","Max ms"]].map(([field, headerName]) => ({ field, headerName, width: 105, type: "number" as const, valueFormatter: n })),
    ...[["cache_hits","CDN hits"],["cache_misses","CDN misses"],["cache_bypasses","CDN bypasses"]].map(([field, headerName]) => ({ field, headerName, width: 115, type: "number" as const, valueFormatter: n })),
    { field: "first_request_at", headerName: "First request (IST)", width: 185, valueFormatter: (v) => formatIst(v) },
    { field: "last_request_at", headerName: "Last request (IST)", width: 185, valueFormatter: (v) => formatIst(v) },
  ];
  return <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>API details</Typography>
    <DataGrid rows={rows.map((row, i) => ({ ...row, id: `${row.bucket_start}-${row.method}-${row.normalized_path}-${i}` }))} columns={columns} autoHeight disableRowSelectionOnClick onRowClick={({ row }) => onSelect(row as ApiResourceStat)} initialState={{ sorting: { sortModel: [{ field: "total_requests", sort: "desc" }] }, pagination: { paginationModel: { pageSize: 25 } } }} pageSizeOptions={[10,25,50,100]} sx={{ minWidth: 900 }} />
  </Paper>;
};
