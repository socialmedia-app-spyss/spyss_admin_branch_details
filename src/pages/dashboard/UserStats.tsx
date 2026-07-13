import { Card, CardActionArea, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

export const UserStats = () => {
  const navigate = useNavigate();
  const users = useList({ resource: "user_profiles", pagination: { mode: "off" } });
  const pending = useList({
    resource: "user_profiles",
    filters: [{ field: "status", operator: "eq", value: "PENDING" }],
    pagination: { mode: "off" },
  });

  if (users.query.isLoading || pending.query.isLoading) return <CircularProgress size={24} />;
  if (users.query.isError || pending.query.isError) return <Typography color="error">Error loading user stats.</Typography>;

  const cards = [
    { label: "Total Users", count: users.result?.data.length ?? 0, color: "primary.main" },
    { label: "Pending Users", count: pending.result?.data.length ?? 0, color: "secondary.main" },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} key={card.label}>
          <Card>
            <CardActionArea onClick={() => navigate("/users")}>
              <CardContent>
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
