import { Card, CardActionArea, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../types/event";

export const EventStats = () => {
  const navigate = useNavigate();
  const { result, query } = useList<Event>({
    resource: "events",
    pagination: { mode: "off" },
  });

  if (query.isLoading) return <CircularProgress size={24} />;
  if (query.isError) return <Typography color="error">Error loading event stats.</Typography>;

  const events = result?.data ?? [];
  const now = Date.now();
  const total = events.length;
  const upcoming = events.filter((event) =>
    Boolean(event.is_active && event.start_datetime && new Date(event.start_datetime).getTime() > now)
  ).length;
  const ongoing = events.filter((event) =>
    Boolean(
      event.is_active
      && event.start_datetime
      && new Date(event.start_datetime).getTime() <= now
      && (!event.end_datetime || new Date(event.end_datetime).getTime() >= now)
    )
  ).length;
  const completed = events.filter((event) =>
    Boolean(event.is_active && event.end_datetime && new Date(event.end_datetime).getTime() < now)
  ).length;

  const cards = [
    { label: "Total Events", count: total, color: "primary.main" },
    { label: "Upcoming Events", count: upcoming, color: "info.main" },
    { label: "Ongoing Events", count: ongoing, color: "warning.main" },
    { label: "Completed Events", count: completed, color: "success.main" },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.label}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              bgcolor: `${card.color === "primary.main" ? "#1976d2" : card.color === "info.main" ? "#0288d1" : card.color === "warning.main" ? "#ed6c02" : "#2e7d32"}0A`,
              borderColor: `${card.color === "primary.main" ? "#1976d2" : card.color === "info.main" ? "#0288d1" : card.color === "warning.main" ? "#ed6c02" : "#2e7d32"}2E`,
            }}
          >
            <CardActionArea onClick={() => navigate("/events")} sx={{ height: "100%" }}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="h6">{card.label}</Typography>
                <Typography variant="h4" sx={{ color: card.color }}>{card.count}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
