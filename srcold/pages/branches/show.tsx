import React from "react";
import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import {
  Typography,
  Box,
  // CircularProgress, // Removed
  TextField,
} from "@mui/material";
// import { AuthGuard } from "../../components/guards/AuthGuard"; // Removed
// import { ROLES } from "../../types/roles"; // Removed
// import { useUserRole } from "../../hooks/useUserRole"; // Removed
// import { useNavigate } from "react-router-dom"; // Removed

export const BranchShow: React.FC<IResourceComponentsProps> = () => {
  // const { loading: userRoleLoading, role, status } = useUserRole(); // Removed
  // const navigate = useNavigate(); // Removed

  // // Manual check for AuthGuard logic within the component // Removed
  // const allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN]; // Removed
  // const isActive = status === "ACTIVE"; // Removed
  // const isAuthorized = role && allowedRoles.includes(role as keyof typeof ROLES) && isActive; // Removed

  // if (userRoleLoading) { // Removed
  //   return ( // Removed
  //     <Box // Removed
  //       sx={{ // Removed
  //         display: "flex", // Removed
  //         justifyContent: "center", // Removed
  //         alignItems: "center", // Removed
  //         height: "100vh", // Removed
  //       }} // Removed
  //     > // Removed
  //       <CircularProgress /> // Removed
  //     </Box> // Removed
  //   ); // Removed
  // } // Removed

  // if (!isAuthorized) { // Removed
  //   navigate("/access-denied", { replace: true }); // Removed
  //   return null; // Removed
  // } // Removed

  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  // if (isLoading) { // Refine's Show component handles loading state
  //   return ( // Removed
  //     <Box // Removed
  //       sx={{ // Removed
  //         display: "flex", // Removed
  //         justifyContent: "center", // Removed
  //         alignItems: "center", // Removed
  //         height: "100vh", // Removed
  //       }} // Removed
  //     > // Removed
  //       <CircularProgress /> // Removed
  //     </Box> // Removed
  //   ); // Removed
  // } // Removed

  return (
    <Show isLoading={isLoading}>
      <Box display="flex" flexDirection="column" gap="10px">
        <Typography variant="h6">ID</Typography>
        <TextField value={record?.id} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Branch Name</Typography>
        <TextField value={record?.branch_name} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Address</Typography>
        <TextField value={record?.address} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Contact No</Typography>
        <TextField value={record?.contact_no} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Category</Typography>
        <TextField value={record?.category} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Batch</Typography>
        <TextField value={record?.batch} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Mukhyashikshak Name</Typography>
        <TextField value={record?.mukhyashikshak_name} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Class Timings</Typography>
        <TextField value={record?.class_timings} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Country Code/Name</Typography>
        <TextField value={record?.country_code_or_name} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Admin Level 1 (State)</Typography>
        <TextField value={record?.admin_level_1} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">City</Typography>
        <TextField value={record?.city} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Admin Level 3 (Area)</Typography>
        <TextField value={record?.admin_level_3} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Latitude</Typography>
        <TextField value={record?.latitude} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Longitude</Typography>
        <TextField value={record?.longitude} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Is Active</Typography>
        <TextField value={record?.is_active ? "Yes" : "No"} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Created At</Typography>
        <TextField value={new Date(record?.created_at).toLocaleString()} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6">Updated At</Typography>
        <TextField value={new Date(record?.updated_at).toLocaleString()} InputProps={{ readOnly: true }} fullWidth />
      </Box>
    </Show>
  );
};