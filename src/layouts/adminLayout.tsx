import React from "react";
import { ThemedLayout } from "@refinedev/mui";
import { Box, Typography } from "@mui/material"; // Import Box and Typography

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  // Custom Title component to avoid nested <a> tags
  // This component should NOT contain any Link or <a> tag itself,
  // as ThemedLayout will wrap it with a Link to the dashboard.
  const CustomTitle = ({ collapsed }: { collapsed: boolean }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1,
        padding: "12px 24px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <img
        src="/spyss-logo.svg" // Your desired icon
        alt="SPYSS Admin logo"
        style={{ height: "24px", minWidth: "24px" }}
      />
      {!collapsed && (
        <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary" }}>
          SPYSS Admin
        </Typography>
      )}
    </Box>
  );

  return (
    <ThemedLayout Title={CustomTitle}>
      {children}
    </ThemedLayout>
  );
};