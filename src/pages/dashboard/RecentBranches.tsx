import React from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

export const RecentBranches: React.FC = () => {
  const { query: { data: branchesData, isLoading, isError } } = useList({ // Corrected destructuring
    resource: "latest_branches",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error loading recent branches.</Typography>
        </CardContent>
      </Card>
    );
  }

  const branches = branchesData?.data || [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Recent Branches
        </Typography>
        {branches.length > 0 ? (
          <List>
            {branches.map((branch: any) => (
              <ListItem key={branch.id}>
                <ListItemText primary={branch.branch_name} secondary={new Date(branch.created_at).toLocaleDateString()} /> {/* Changed to branch.branch_name */}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No recent branches found.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
