import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sider from '../components/sider/Sider';
import Header from '../components/header/Header'; // Import the Header component

interface AdminLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header /> {/* Integrate the Header component */}
      <Toolbar /> {/* This Toolbar is needed to push content below the fixed AppBar height */}

      <Sider />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;