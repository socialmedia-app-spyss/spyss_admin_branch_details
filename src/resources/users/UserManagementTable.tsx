import { useEffect, useMemo, useState } from "react";
import { useGetIdentity, useTable } from "@refinedev/core";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { List } from "@refinedev/mui";

import {
  UserProfile,
  UserRole,
  userRoleOptions,
  userStatusOptions,
} from "../../types/user";
import { userService } from "../../services/userService";
import { getDistinctValayaOptions, type ValayaOption } from "../../services/valayaScope";

export const UserManagementTable = () => {
  const { data: currentUser } = useGetIdentity<UserProfile>();
  const [valayaOptions, setValayaOptions] = useState<ValayaOption[]>([]);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isValayaAdmin = currentUser?.role === "VALAYA_ADMIN";

  const allowedRoleOptions = useMemo(
    () =>
      isSuperAdmin
        ? userRoleOptions
        : userRoleOptions.filter((role) => role === "USER"),
    [isSuperAdmin],
  );

  const { tableQuery } = useTable<UserProfile>({
    resource: "user_profiles",
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const users: UserProfile[] = tableQuery.data?.data ?? [];

  useEffect(() => {
    const loadValayaOptions = async () => {
      setValayaOptions(await getDistinctValayaOptions());
    };

    void loadValayaOptions();
  }, []);

  const refresh = async () => {
    await tableQuery.refetch();
  };

  const handleAction = async (
    action: () => Promise<{ error: Error | null } | unknown>,
  ) => {
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

    await refresh();
  };

  const getRoleOptionsForUser = (user: UserProfile) =>
    allowedRoleOptions.includes(user.role)
      ? allowedRoleOptions
      : [...allowedRoleOptions, user.role];

  const getValayaOptionsForUser = (user: UserProfile) => {
    const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;

    if (!valayaId || valayaOptions.some((valaya) => valaya.id === valayaId)) {
      return valayaOptions;
    }

    return [
      ...valayaOptions,
      {
        id: valayaId,
        valaya_name: user.valaya_name || currentUser?.valaya_name || "Assigned Valaya",
        valaya_code: user.valaya_code || currentUser?.valaya_code || valayaId,
      },
    ];
  };

  const getSafeValayaValue = (user: UserProfile) => {
    const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;
    return getValayaOptionsForUser(user).some((valaya) => valaya.id === valayaId) ? valayaId ?? "" : "";
  };

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (role === "VALAYA_ADMIN") {
      const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;

      await handleAction(() =>
        userService.updateRole(user.id, role, {
          valaya_id: valayaId ?? null,
          district_id: null,
          branch_id: null,
        }),
      );
      return;
    }

    await handleAction(() => userService.updateRole(user.id, role));
  };

  const handleValayaChange = async (user: UserProfile, valayaId: string) => {
    await handleAction(() =>
      userService.updateRole(user.id, "VALAYA_ADMIN", {
        valaya_id: valayaId,
        district_id: null,
        branch_id: null,
      }),
    );
  };

  return (
    <List title="User Management">
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Valaya</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell sx={{ minWidth: 180 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id={`role-${u.id}`}>Role</InputLabel>
                    <Select
                      labelId={`role-${u.id}`}
                      label="Role"
                      value={getRoleOptionsForUser(u).includes(u.role) ? u.role : ""}
                      disabled={u.id === currentUser?.id && u.role === "SUPER_ADMIN"}
                      onChange={(event) =>
                        handleRoleChange(u, event.target.value as UserRole)
                      }
                    >
                      <MenuItem value="">Select role</MenuItem>
                      {getRoleOptionsForUser(u).map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  {u.role === "VALAYA_ADMIN" ? (
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`valaya-${u.id}`}>Valaya</InputLabel>
                      <Select
                        labelId={`valaya-${u.id}`}
                        label="Valaya"
                        value={getSafeValayaValue(u)}
                        disabled={!isSuperAdmin}
                        onChange={(event) =>
                          handleValayaChange(u, event.target.value)
                        }
                      >
                        <MenuItem value="">Select Valaya</MenuItem>
                        {getValayaOptionsForUser(u).map((valaya) => (
                          <MenuItem key={valaya.id} value={valaya.id}>
                            {valaya.valaya_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 170 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id={`status-${u.id}`}>Status</InputLabel>
                    <Select
                      labelId={`status-${u.id}`}
                      label="Status"
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
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>

                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {u.status === "PENDING" && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleAction(() =>
                            userService.approveUser(u.id, currentUser?.id),
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
                            userService.rejectUser(u.id, currentUser?.id),
                          )
                        }
                        sx={{ ml: 1 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {u.id === currentUser?.id && u.role === "SUPER_ADMIN" && (
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
