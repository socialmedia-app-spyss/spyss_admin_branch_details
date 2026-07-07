import { useEffect, useMemo, useState } from "react";
import { useGetIdentity, useTable } from "@refinedev/core";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { supabaseClient } from "../../supabaseClient";
import type { MasterState } from "../../types/branch";

export const UserManagementTable = () => {
  const { data: currentUser } = useGetIdentity<UserProfile>();
  const [valayaOptions, setValayaOptions] = useState<ValayaOption[]>([]);
  const [stateOptions, setStateOptions] = useState<MasterState[]>([]);
  const [pendingValayaUser, setPendingValayaUser] = useState<UserProfile | null>(null);
  const [pendingValayaId, setPendingValayaId] = useState("");
  const [pendingStateId, setPendingStateId] = useState("");
  const [pendingApprovalUser, setPendingApprovalUser] = useState<UserProfile | null>(null);
  const [approvalRole, setApprovalRole] = useState<UserRole>("USER");
  const [approvalStateId, setApprovalStateId] = useState("");
  const [approvalValayaId, setApprovalValayaId] = useState("");

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

  const defaultStateId = useMemo(() => {
    const karnataka = stateOptions.find((state) => {
      const name = state.state_name.toLowerCase();
      const code = state.state_code.toLowerCase();
      return name === "karnataka" || code === "ka" || code === "kar";
    });

    return karnataka?.id ?? stateOptions[0]?.id ?? "";
  }, [stateOptions]);

  useEffect(() => {
    const loadScopeOptions = async () => {
      const [valayas, states] = await Promise.all([
        getDistinctValayaOptions(),
        supabaseClient
          .from("master_states")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);

      setValayaOptions(valayas);
      setStateOptions((states.data ?? []) as MasterState[]);
    };

    void loadScopeOptions();
  }, []);

  useEffect(() => {
    if (!defaultStateId) {
      return;
    }

    if (pendingValayaUser && !pendingStateId) {
      setPendingStateId(defaultStateId);
    }

    if (
      pendingApprovalUser &&
      !approvalStateId &&
      (approvalRole === "STATE_ADMIN" || approvalRole === "VALAYA_ADMIN")
    ) {
      setApprovalStateId(defaultStateId);
    }
  }, [
    approvalRole,
    approvalStateId,
    defaultStateId,
    pendingApprovalUser,
    pendingStateId,
    pendingValayaUser,
  ]);

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
      return false;
    }

    await refresh();
    return true;
  };

  const getRoleOptionsForUser = (user: UserProfile) =>
    allowedRoleOptions.includes(user.role)
      ? allowedRoleOptions
      : [...allowedRoleOptions, user.role];

  const getApprovalRoleOptionsForUser = (user: UserProfile) =>
    getRoleOptionsForUser(user).filter(
      (role) => role !== "DISTRICT_ADMIN" && role !== "BRANCH_ADMIN",
    );

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
        state_id: user.state_id || currentUser?.state_id || null,
      },
    ];
  };

  const getSafeValayaValue = (user: UserProfile) => {
    const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;
    return getValayaOptionsForUser(user).some((valaya) => valaya.id === valayaId) ? valayaId ?? "" : "";
  };

  const getSelectedValayaOption = (user: UserProfile, valayaId: string) =>
    getValayaOptionsForUser(user).find((valaya) => valaya.id === valayaId);

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (role === "VALAYA_ADMIN") {
      const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;
      const selectedValaya = valayaId ? getSelectedValayaOption(user, valayaId) : null;

      setPendingValayaUser(user);
      setPendingValayaId(valayaId ?? "");
      setPendingStateId(selectedValaya?.state_id ?? user.state_id ?? currentUser?.state_id ?? defaultStateId);
      return;
    }

    await handleAction(() => userService.updateRole(user.id, role));
  };

  const closeValayaPrompt = () => {
    setPendingValayaUser(null);
    setPendingValayaId("");
    setPendingStateId("");
  };

  const openApprovalPrompt = (user: UserProfile) => {
    const approvalRoleOptions = getApprovalRoleOptionsForUser(user);
    const role: UserRole = approvalRoleOptions.some((option) => option === user.role) ? user.role : "USER";
    const valayaId = isValayaAdmin ? currentUser?.valaya_id : user.valaya_id;
    const selectedValaya = valayaId ? getSelectedValayaOption(user, valayaId) : null;

    setPendingApprovalUser(user);
    setApprovalRole(role);
    setApprovalValayaId(valayaId ?? "");
    setApprovalStateId(selectedValaya?.state_id ?? user.state_id ?? currentUser?.state_id ?? defaultStateId);
  };

  const closeApprovalPrompt = () => {
    setPendingApprovalUser(null);
    setApprovalRole("USER");
    setApprovalStateId("");
    setApprovalValayaId("");
  };

  const handleApprovalRoleChange = (user: UserProfile, role: UserRole) => {
    const valayaId = isValayaAdmin ? currentUser?.valaya_id : approvalValayaId;
    const selectedValaya = valayaId ? getSelectedValayaOption(user, valayaId) : null;

    setApprovalRole(role);

    if (role === "VALAYA_ADMIN" || role === "STATE_ADMIN") {
      setApprovalStateId(selectedValaya?.state_id ?? user.state_id ?? currentUser?.state_id ?? defaultStateId);
    }
  };

  const confirmApproval = async () => {
    if (!pendingApprovalUser) {
      return;
    }

    if (approvalRole === "VALAYA_ADMIN" && (!approvalStateId || !approvalValayaId)) {
      return;
    }

    if (approvalRole === "STATE_ADMIN" && !approvalStateId) {
      return;
    }

    const scope =
      approvalRole === "VALAYA_ADMIN"
        ? {
            state_id: approvalStateId,
            district_id: null,
            valaya_id: approvalValayaId,
            branch_id: null,
          }
        : approvalRole === "STATE_ADMIN"
          ? {
              state_id: approvalStateId,
              district_id: null,
              valaya_id: null,
              branch_id: null,
            }
          : {};

    const updated = await handleAction(() =>
      userService.approveUserWithRole(
        pendingApprovalUser.id,
        approvalRole,
        currentUser?.id,
        scope,
      ),
    );

    if (updated) {
      closeApprovalPrompt();
    }
  };

  const confirmValayaAdminRole = async () => {
    if (!pendingValayaUser || !pendingValayaId || !pendingStateId) {
      return;
    }

    const updated = await handleAction(() =>
      userService.updateRole(pendingValayaUser.id, "VALAYA_ADMIN", {
        state_id: pendingStateId,
        valaya_id: pendingValayaId,
        district_id: null,
        branch_id: null,
      }),
    );

    if (updated) {
      closeValayaPrompt();
    }
  };

  const handleValayaChange = async (user: UserProfile, valayaId: string) => {
    const selectedValaya = getSelectedValayaOption(user, valayaId);
    const stateId = selectedValaya?.state_id ?? user.state_id ?? currentUser?.state_id;

    if (!stateId) {
      window.alert("Selected Valaya is missing state details. Please check the Valaya master data.");
      return;
    }

    await handleAction(() =>
      userService.updateRole(user.id, "VALAYA_ADMIN", {
        state_id: stateId,
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
                        onClick={() => openApprovalPrompt(u)}
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
      <Dialog
        open={Boolean(pendingValayaUser)}
        onClose={closeValayaPrompt}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Select Valaya</DialogTitle>
        <DialogContent>
          {pendingValayaUser && (
            <>
              <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                <InputLabel id="pending-state">State</InputLabel>
                <Select
                  labelId="pending-state"
                  label="State"
                  value={pendingStateId}
                  onChange={(event) => setPendingStateId(event.target.value)}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {stateOptions.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                <InputLabel id="pending-valaya">Valaya</InputLabel>
                <Select
                  labelId="pending-valaya"
                  label="Valaya"
                  value={pendingValayaId}
                  onChange={(event) => {
                    const valayaId = event.target.value;
                    const selectedValaya = getSelectedValayaOption(pendingValayaUser, valayaId);

                    setPendingValayaId(valayaId);

                    if (selectedValaya?.state_id) {
                      setPendingStateId(selectedValaya.state_id);
                    }
                  }}
                >
                  <MenuItem value="">Select Valaya</MenuItem>
                  {getValayaOptionsForUser(pendingValayaUser).map((valaya) => (
                    <MenuItem key={valaya.id} value={valaya.id}>
                      {valaya.valaya_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeValayaPrompt}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmValayaAdminRole}
            disabled={!pendingStateId || !pendingValayaId}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(pendingApprovalUser)}
        onClose={closeApprovalPrompt}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          {pendingApprovalUser && (
            <>
              <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                <InputLabel id="approval-role">Role</InputLabel>
                <Select
                  labelId="approval-role"
                  label="Role"
                  value={approvalRole}
                  onChange={(event) =>
                    handleApprovalRoleChange(pendingApprovalUser, event.target.value as UserRole)
                  }
                >
                  {getApprovalRoleOptionsForUser(pendingApprovalUser).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(approvalRole === "STATE_ADMIN" || approvalRole === "VALAYA_ADMIN") && (
                <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="approval-state">State</InputLabel>
                  <Select
                    labelId="approval-state"
                    label="State"
                    value={approvalStateId}
                    onChange={(event) => setApprovalStateId(event.target.value)}
                  >
                    <MenuItem value="">Select State</MenuItem>
                    {stateOptions.map((state) => (
                      <MenuItem key={state.id} value={state.id}>
                        {state.state_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {approvalRole === "VALAYA_ADMIN" && (
                <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="approval-valaya">Valaya</InputLabel>
                  <Select
                    labelId="approval-valaya"
                    label="Valaya"
                    value={approvalValayaId}
                    onChange={(event) => {
                      const valayaId = event.target.value;
                      const selectedValaya = getSelectedValayaOption(pendingApprovalUser, valayaId);

                      setApprovalValayaId(valayaId);
                      setApprovalStateId(selectedValaya?.state_id ?? defaultStateId);
                    }}
                  >
                    <MenuItem value="">Select Valaya</MenuItem>
                    {getValayaOptionsForUser(pendingApprovalUser).map((valaya) => (
                      <MenuItem key={valaya.id} value={valaya.id}>
                        {valaya.valaya_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApprovalPrompt}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmApproval}
            disabled={
              (approvalRole === "STATE_ADMIN" && !approvalStateId) ||
              (approvalRole === "VALAYA_ADMIN" && (!approvalStateId || !approvalValayaId))
            }
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </List>
  );
};
