import { Box, Button, Card, CardActionArea, CardContent, Chip, Grid, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useList } from "@refinedev/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPanchangaMonthRange } from "../../resources/panchanga/monthFilter";
import type { DailyPanchanga } from "../../types/panchanga";

export const PanchangaStats = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState("");
  const { result, query } = useList<DailyPanchanga>({
    resource: "daily_panchanga",
    pagination: { mode: "off" },
  });
  const records = result?.data ?? [];
  const monthRange = selectedMonth ? getPanchangaMonthRange(selectedMonth) : null;
  const visibleRecords = monthRange
    ? records.filter(
        (item) =>
          item.panchanga_date >= monthRange.start &&
          item.panchanga_date < monthRange.nextMonth,
      )
    : records;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const items = [
    ["Total Entries", visibleRecords.length, "#1976d2"],
    ["Approved", visibleRecords.filter((item) => item.approve_status).length, "#2e7d32"],
    ["Not Approved", visibleRecords.filter((item) => !item.approve_status).length, "#ed6c02"],
    ["Today & Upcoming", visibleRecords.filter((item) => item.panchanga_date >= today).length, "#0288d1"],
  ] as const;
  const approvedCount = visibleRecords.filter((item) => item.approve_status).length;
  const approvalPercent = visibleRecords.length
    ? Math.round((approvedCount / visibleRecords.length) * 100)
    : 0;

  const todayEntry = records.find((item) => item.panchanga_date === today);
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const tomorrowEntry = records.find((item) => item.panchanga_date === tomorrow);

  if (query.isError) {
    return <Typography color="error">Unable to load Panchanga statistics.</Typography>;
  }

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems={{ sm: "center" }}>
        <TextField
          type="month"
          label="Filter by month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: "100%", sm: 220 } }}
        />
        <Button variant="outlined" onClick={() => setSelectedMonth("")} disabled={!selectedMonth}>
          Clear filter
        </Button>
      </Stack>
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Typography variant="body2" fontWeight={650}>Approval progress</Typography>
          <Typography variant="body2" color="text.secondary">
            {approvedCount} / {visibleRecords.length} approved ({approvalPercent}%)
          </Typography>
        </Stack>
        <LinearProgress color="success" variant="determinate" value={approvalPercent} sx={{ height: 10, borderRadius: 10 }} />
      </Box>
      {todayEntry ? (
        <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">Today's Panchanga</Typography>
              <Typography fontWeight={700}>{todayEntry.display_date || todayEntry.panchanga_date}</Typography>
            </Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip size="small" label={todayEntry.approve_status ? "Approved" : "Waiting approval"} color={todayEntry.approve_status ? "success" : "warning"} />
              <Chip size="small" label={todayEntry.image_url ? "Image uploaded" : "Image pending"} color={todayEntry.image_url ? "success" : "default"} variant="outlined" />
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "error.main" }}>
          <Typography color="white">Today's Panchanga not available</Typography>
        </Box>
      )}
      {tomorrowEntry ? (
        <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "action.hover" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">Tomorrow's Panchanga</Typography>
              <Typography fontWeight={700}>{tomorrowEntry.display_date || tomorrowEntry.panchanga_date}</Typography>
            </Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip size="small" label={tomorrowEntry.approve_status ? "Approved" : "Waiting approval"} color={tomorrowEntry.approve_status ? "success" : "warning"} />
              <Chip size="small" label={tomorrowEntry.image_url ? "Image uploaded" : "Image pending"} color={tomorrowEntry.image_url ? "success" : "default"} variant="outlined" />
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "error.main" }}>
          <Typography color="white">Tomorrow's Panchanga not available</Typography>
        </Box>
      )}
      <Grid container spacing={2}>
        {items.map(([label, count, color]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, bgcolor: `${color}0A`, borderColor: `${color}2E` }}
            >
              <CardActionArea
                onClick={() =>
                  navigate(selectedMonth ? `/panchanga?month=${selectedMonth}` : "/panchanga")
                }
              >
                <CardContent>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h4" fontWeight={750} sx={{ color }}>
                    {query.isLoading ? "—" : count}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};