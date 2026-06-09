import React, { useEffect, useState } from 'react';
import { useUserRole } from '../../../hooks/useUserRole';
import { supabaseClient } from '../../../providers/supabase-client';
import { ROLES } from '../../../types/roles'; // Import ROLES
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotification, useGetIdentity } from '@refinedev/core';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

const UserListPage: React.FC = () => {
  const { loading: userRoleLoading, isSuperAdmin } = useUserRole();
  const navigate = useNavigate();
  const { open: openNotification } = useNotification();
  const { data: currentUser } = useGetIdentity<{ id: string }>();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('id, email, full_name, role, status, created_at, approved_by, approved_at');

      if (error) {
        throw error;
      }
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!userRoleLoading && !isSuperAdmin) {
      navigate("/access-denied");
    }
  }, [userRoleLoading, isSuperAdmin, navigate]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const handleApprove = async (userId: string) => {
    if (!currentUser?.id) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: 'Could not get current user ID for approval.',
      });
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({
          status: 'ACTIVE',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      openNotification({
        type: 'success',
        message: 'Success',
        description: 'User approved successfully.',
      });
      fetchUsers();
    } catch (err: any) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: err.message || 'Failed to approve user.',
      });
      console.error('Error approving user:', err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({
          status: 'REJECTED',
          approved_by: null,
          approved_at: null,
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      openNotification({
        type: 'success',
        message: 'Success',
        description: 'User rejected successfully.',
      });
      fetchUsers();
    } catch (err: any) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: err.message || 'Failed to reject user.',
      });
      console.error('Error rejecting user:', err);
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ role: ROLES.ADMIN })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      openNotification({
        type: 'success',
        message: 'Success',
        description: 'User promoted to ADMIN.',
      });
      fetchUsers();
    } catch (err: any) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: err.message || 'Failed to promote user.',
      });
      console.error('Error promoting user:', err);
    }
  };

  const handleDemoteToUser = async (userId: string) => {
    try {
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ role: ROLES.USER })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      openNotification({
        type: 'success',
        message: 'Success',
        description: 'User demoted to USER.',
      });
      fetchUsers();
    } catch (err: any) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: err.message || 'Failed to demote user.',
      });
      console.error('Error demoting user:', err);
    }
  };

  if (userRoleLoading || loadingUsers) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  // Filter out the currently logged-in user from the list
  const filteredUsers = users.filter(user => user.id !== currentUser?.id);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Approved At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => ( // Use filteredUsers here
              <TableRow
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>{user.approved_by || 'N/A'}</TableCell>
                <TableCell>{user.approved_at ? new Date(user.approved_at).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>
                  {user.status === 'PENDING' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </Button>
                  )}
                  {user.status !== 'REJECTED' && user.status !== 'PENDING' && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      sx={{ mr: 1 }}
                      onClick={() => handleReject(user.id)}
                    >
                      Reject
                    </Button>
                  )}
                  {user.role === ROLES.USER && user.status === 'ACTIVE' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handlePromoteToAdmin(user.id)}
                    >
                      Promote to Admin
                    </Button>
                  )}
                  {user.role === ROLES.ADMIN && user.status === 'ACTIVE' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoteToUser(user.id)}
                    >
                      Demote to User
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredUsers.length === 0 && !loadingUsers && (
        <Typography sx={{ mt: 2 }}>No users found (excluding yourself).</Typography>
      )}
    </Box>
  );
};

export default UserListPage;