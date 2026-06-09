import React from "react";
import { Typography, Box } from "@mui/material";

export const SystemConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5">System Configuration</Typography>
      <Typography variant="body1">
        This page will allow managing system-wide configurations.
      </Typography>
    </Box>
  );
};
