import React from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '../../types/roles';

interface AuthGuardProps {
  allowedRoles?: (keyof typeof ROLES)[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  const { loading, role, status } = useUserRole();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isActive = status === 'ACTIVE';

  if (!isActive) {
    return <Navigate to="/access-denied" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role as keyof typeof ROLES)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;