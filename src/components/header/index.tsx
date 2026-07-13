import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useGetIdentity } from "@refinedev/core";
import { HamburgerMenu, RefineThemedLayoutHeaderProps } from "@refinedev/mui";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { useLanguage } from "../../hooks/useLanguage";
import { UserProfile } from "../../types/user"; // Import UserProfile type

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const { language, setLanguage } = useLanguage();

  const { data: user } = useGetIdentity<UserProfile>();

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between" // Changed to space-between to push items to ends
          alignItems="center"
        >
          <HamburgerMenu />
          
          {/* Directly render full_name here for testing */}
          {user?.full_name && (
            <div style={{ color: 'white', fontWeight: 'bold', marginRight: '16px' }}>
              Welcome, {user.full_name}
            </div>
          )}

          <Stack
            direction="row"
            gap="16px"
            alignItems="center"
            justifyContent="flex-end" // Aligned to end
          >
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => setLanguage(language === "en" ? "kn" : "en")}
              aria-label={language === "en" ? "Switch to Kannada" : "Switch to English"}
              sx={{ minWidth: 88, borderColor: "currentColor" }}
            >
              {language === "en" ? "ಕನ್ನಡ" : "English"}
            </Button>

            <IconButton
              color="inherit"
              onClick={() => {
                setMode();
              }}
            >
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>

            {/* Removed the Avatar component that was trying to use user.avatar_url */}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
