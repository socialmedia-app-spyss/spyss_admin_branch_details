import { Button, Card, CardActionArea, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
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
    ["Total Entries", visibleRecords.length],
    ["Approved", visibleRecords.filter((item) => item.approve_status).length],
    ["Not Approved", visibleRecords.filter((item) => !item.approve_status).length],
    ["Upcoming", visibleRecords.filter((item) => item.panchanga_date >= today).length],
  ] as const;

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
      <Grid container spacing={2}>
        {items.map(([label, count]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card variant="outlined">
              <CardActionArea
                onClick={() =>
                  navigate(selectedMonth ? `/panchanga?month=${selectedMonth}` : "/panchanga")
                }
              >
                <CardContent>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h4" fontWeight={700}>
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
