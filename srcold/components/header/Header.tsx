import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { data: user } = useGetIdentity<{ name: string; email: string; role: string }>();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          SPYSS Admin Panel
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user.name || user.email} ({user.role})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;