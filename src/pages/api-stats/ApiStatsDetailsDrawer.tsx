import { Drawer, Box, IconButton, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ApiResourceStat } from "./types";
import { formatIst } from "./utils";

export const ApiStatsDetailsDrawer = ({ row, onClose }: { row: ApiResourceStat | null; onClose: () => void }) => <Drawer anchor="right" open={Boolean(row)} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 3 } }}>
  {row && <><Box display="flex" justifyContent="space-between" alignItems="center"><Typography variant="h6" fontWeight={750}>{row.resource}</Typography><IconButton onClick={onClose}><CloseIcon /></IconButton></Box><Typography color="text.secondary">{row.method} {row.normalized_path}</Typography><Divider sx={{ my: 2 }} />
    {[ ["Hour (IST)", formatIst(row.bucket_start)], ["Requests", row.total_requests], ["2xx / 3xx", `${row.success_2xx} / ${row.redirect_3xx}`], ["4xx / 5xx", `${row.client_error_4xx} / ${row.server_error_5xx}`], ["Average / P95", `${row.avg_response_ms ?? "—"} / ${row.p95_response_ms ?? "—"} ms`], ["Maximum", `${row.max_response_ms ?? "—"} ms`], ["First request", formatIst(row.first_request_at)], ["Last request", formatIst(row.last_request_at)] ].map(([k,v]) => <Box key={String(k)} display="flex" justifyContent="space-between" gap={2} py={1}><Typography color="text.secondary">{k}</Typography><Typography textAlign="right">{v}</Typography></Box>)}</>}
</Drawer>;
