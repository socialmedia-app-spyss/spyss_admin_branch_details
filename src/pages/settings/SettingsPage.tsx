import React from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Settings</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Manage various settings for the SPYSS Admin Panel.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/settings/admin-users")}
        >
          Manage Admin Users
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/settings/roles")}
        >
          Manage Roles
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/settings/system-config")}
        >
          System Configuration
        </Button>
      </Stack>
    </Box>
  );
};
