import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { HourlyMatrixDatum } from "./types";
import { formatIst, pivotHourlyMatrix } from "./utils";

export const ApiStatsHourlyMatrix = ({ data, onSelect }: { data: HourlyMatrixDatum[]; onSelect: (bucket: string | null, resource: string | null) => void }) => {
  const { resources, rows } = pivotHourlyMatrix(data);
  const total = (resource: string) => rows.reduce((sum, row) => sum + (row.values[resource] ?? 0), 0);
  const cell = (value: number, bucket: string | null, resource: string | null) => <TableCell align="right" onClick={() => value && onSelect(bucket, resource)} sx={{ cursor: value ? "pointer" : "default", color: value ? "primary.main" : "text.disabled", fontWeight: value ? 650 : 400 }}>{value.toLocaleString()}</TableCell>;
  return <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
    <Typography variant="h6" fontWeight={700} sx={{ p: 2 }}>Hourly resource matrix</Typography>
    <TableContainer sx={{ maxWidth: "100%" }}><Table size="small" sx={{ minWidth: 700 + resources.length * 130 }}>
      <TableHead><TableRow><TableCell sx={{ position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 1 }}>Hour (IST)</TableCell>{resources.map(r => <TableCell key={r} align="right">{r}</TableCell>)}<TableCell align="right">Application API total</TableCell><TableCell align="right">Storage/CDN requests</TableCell></TableRow></TableHead>
      <TableBody>{rows.map(row => <TableRow key={row.bucketStart} hover><TableCell sx={{ position: "sticky", left: 0, bgcolor: "background.paper", whiteSpace: "nowrap" }}>{formatIst(row.bucketStart)}</TableCell>{resources.map(r => cell(row.values[r] ?? 0, row.bucketStart, r))}{cell(row.applicationTotal, row.bucketStart, null)}{cell(row.storageTotal, row.bucketStart, "Storage/CDN")}</TableRow>)}
      {rows.length > 0 && <TableRow sx={{ "& td": { fontWeight: 750, borderTop: 2 } }}><TableCell>Daily total</TableCell>{resources.map(r => cell(total(r), null, r))}{cell(rows.reduce((s,r)=>s+r.applicationTotal,0),null,null)}{cell(rows.reduce((s,r)=>s+r.storageTotal,0),null,"Storage/CDN")}</TableRow>}</TableBody>
    </Table></TableContainer>
  </Paper>;
};
