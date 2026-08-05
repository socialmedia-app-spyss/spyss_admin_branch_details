import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { Button, Menu, MenuItem, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";

interface UserProfile {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "STATE_ADMIN" | "DISTRICT_ADMIN" | "VALAYA_ADMIN" | "BRANCH_ADMIN" | "PANCHANGA_ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}

export const QuickActions: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<UserProfile>();
  const isAdminOrSuperAdmin =
    identity?.role === "SUPER_ADMIN" ||
    identity?.role === "STATE_ADMIN" ||
    identity?.role === "DISTRICT_ADMIN" ||
    identity?.role === "VALAYA_ADMIN" ||
    identity?.role === "BRANCH_ADMIN";
  const isSuperAdmin = identity?.role === "SUPER_ADMIN";
  const canManagePanchanga = isSuperAdmin || identity?.role === "PANCHANGA_ADMIN";

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button variant="contained" startIcon={<AddIcon />} onClick={(event) => setAnchorEl(event.currentTarget)}>
        Create
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {isAdminOrSuperAdmin && <MenuItem onClick={() => { setAnchorEl(null); navigate("/branches/create"); }}>Create Branch</MenuItem>}
        {isSuperAdmin && <MenuItem onClick={() => { setAnchorEl(null); navigate("/notifications/create"); }}>Create Notification</MenuItem>}
        {isSuperAdmin && <MenuItem onClick={() => { setAnchorEl(null); navigate("/events/create"); }}>Create Event</MenuItem>}
      </Menu>
      {canManagePanchanga && (
        <Button variant="outlined" startIcon={<CalendarMonthOutlinedIcon />} onClick={() => navigate("/panchanga")}>
          Manage Panchanga
        </Button>
      )}
      {isSuperAdmin && <Button variant="outlined" startIcon={<ManageAccountsOutlinedIcon />} onClick={() => navigate("/users")}>Manage Admin Users</Button>}
    </Stack>
  );
};
