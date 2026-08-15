import { Box, Paper, Typography } from "@mui/material";
import type { ApiResourceStat, CollectionRun } from "./types";
import { calculateSummary, formatIst } from "./utils";

export const ApiStatsSummaryCards = ({ rows, latest }: { rows: ApiResourceStat[]; latest?: CollectionRun }) => {
  const summary = calculateSummary(rows);
  const cards = [
    ["Total API requests", summary.total.toLocaleString()], ["Successful requests", summary.successful.toLocaleString()],
    ["4xx failures", summary.fourXx.toLocaleString()], ["5xx failures", summary.fiveXx.toLocaleString()],
    ["Success percentage", `${summary.successPercent.toFixed(1)}%`], ["Average response time", `${summary.averageMs.toFixed(0)} ms`],
    ["P95 response time", `${summary.p95Ms.toFixed(0)} ms`], ["CDN hit rate", `${summary.cdnHitRate.toFixed(1)}%`],
    ["Last completed collection", formatIst(latest?.completed_at ?? null)],
  ];
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" }, gap: 1.5 }}>
    {cards.map(([label, value]) => <Paper variant="outlined" key={label} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={750} sx={{ mt: .5 }}>{value}</Typography>
    </Paper>)}
  </Box>;
};
