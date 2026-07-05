import {
  useTable,
  useGetIdentity,
} from "@refinedev/core";

import {
  List, // Import List from @refinedev/mui
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Typography,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";

import { UserProfile, userStatusOptions } from "../../types/user";
import { userService } from "../../services/userService";

export const UserListPage = () => {
  const { data: currentUser } = useGetIdentity<UserProfile>();

  const { tableQuery } = useTable<UserProfile>({ // Fix 1: Changed destructuring
    resource: "user_profiles",
    sorters: { // Fix 2: Updated sorters structure
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const users: UserProfile[] = tableQuery.data?.data ?? []; // Fix 1: Access data from tableQuery.data

  const refresh = async () => {
    await tableQuery.refetch(); // Fix 1: Call refetch from tableQuery
  };

  const handleAction = async (action: () => Promise<{ error: Error | null } | unknown>) => { // Fix 3: Updated Promise type
    const result = await action();
    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error
    ) {
      window.alert(String((result.error as { message?: unknown }).message || "Action failed."));
      return;
    }
    await refresh(); // Ensure refresh is awaited
  };

  return (
    <List title="User Management (SUPER ADMIN)">
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={u.status}
                      onChange={(event) =>
                        handleAction(() =>
                          userService.updateStatus(
                            u.id,
                            event.target.value as UserProfile["status"],
                            currentUser?.id,
                          )
                        )
                      }
                    >
                      {userStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {/* APPROVAL FLOW */}
                  {u.status === "PENDING" && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleAction(() =>
                            userService.approveUser(u.id, currentUser?.id)
                          )
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          handleAction(() =>
                            userService.rejectUser(u.id, currentUser?.id)
                          )
                        }
                        sx={{ ml: 1 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* ROLE MANAGEMENT */}
                  {u.role === "USER" && u.status === "APPROVED" && (
                    <Button
                      size="small"
                      onClick={() =>
                        handleAction(() => userService.makeAdmin(u.id))
                      }
                    >
                      Make Super Admin
                    </Button>
                  )}

                  {u.role !== "USER" && u.role !== "SUPER_ADMIN" && (
                    <Button
                      size="small"
                      color="warning"
                      onClick={() =>
                        handleAction(() => userService.makeUser(u.id))
                      }
                    >
                      Demote
                    </Button>
                  )}

                  {/* SAFETY RULE */}
                  {u.id === currentUser?.id &&
                    u.role === "SUPER_ADMIN" && (
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Self-protected
                      </Typography>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </List>
  );
};
