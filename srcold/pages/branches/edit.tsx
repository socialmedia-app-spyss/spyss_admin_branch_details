import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  // CircularProgress, // Removed
  // Typography, // Removed
} from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
// import { AuthGuard } from "../../components/guards/AuthGuard"; // Removed
// import { ROLES } from "../../types/roles"; // Removed
// import { useUserRole } from "../../hooks/useUserRole"; // Removed
// import { useNavigate } from "react-router-dom"; // Removed

export const BranchEdit: React.FC<IResourceComponentsProps> = () => {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    refineCore: { queryResult },
  } = useForm();

  const branchData = queryResult?.data?.data;

  const categoryOptions = ['GENERAL', 'WOMENS', 'PROFESSIONAL', 'YOUTH', 'CHILDRENS'];
  const batchOptions = ['MORNING', 'AFTERNOON', 'EVENING'];

  return (
    <Edit>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
        autoComplete="off"
      >
        <TextField
          {...register("branch_name", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.branch_name}
          helperText={(errors as any)?.branch_name?.message}
          margin="normal"
          fullWidth
          label="Branch Name"
          name="branch_name"
        />
        <TextField
          {...register("address", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.address}
          helperText={(errors as any)?.address?.message}
          margin="normal"
          fullWidth
          label="Address"
          name="address"
        />
        <TextField
          {...register("contact_no", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.contact_no}
          helperText={(errors as any)?.contact_no?.message}
          margin="normal"
          fullWidth
          label="Contact No"
          name="contact_no"
        />
        <FormControl margin="normal" fullWidth error={!!(errors as any)?.category}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            {...register("category", {
              required: "This field is required",
            })}
            defaultValue={branchData?.category}
            label="Category"
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          {/* <Typography variant="caption" color="error"> // Removed */}
            {/* {(errors as any)?.category?.message} // Removed */}
          {/* </Typography> // Removed */}
        </FormControl>
        <FormControl margin="normal" fullWidth error={!!(errors as any)?.batch}>
          <InputLabel id="batch-label">Batch</InputLabel>
          <Select
            labelId="batch-label"
            {...register("batch", {
              required: "This field is required",
            })}
            defaultValue={branchData?.batch}
            label="Batch"
          >
            {batchOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          {/* <Typography variant="caption" color="error"> // Removed */}
            {/* {(errors as any)?.batch?.message} // Removed */}
          {/* </Typography> // Removed */}
        </FormControl>
        <TextField
          {...register("mukhyashikshak_name", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.mukhyashikshak_name}
          helperText={(errors as any)?.mukhyashikshak_name?.message}
          margin="normal"
          fullWidth
          label="Mukhyashikshak Name"
          name="mukhyashikshak_name"
        />
        <TextField
          {...register("class_timings", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.class_timings}
          helperText={(errors as any)?.class_timings?.message}
          margin="normal"
          fullWidth
          label="Class Timings"
          name="class_timings"
        />
        <TextField
          {...register("country_code_or_name", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.country_code_or_name}
          helperText={(errors as any)?.country_code_or_name?.message}
          margin="normal"
          fullWidth
          label="Country Code/Name"
          name="country_code_or_name"
        />
        <TextField
          {...register("admin_level_1", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.admin_level_1}
          helperText={(errors as any)?.admin_level_1?.message}
          margin="normal"
          fullWidth
          label="Admin Level 1 (State)"
          name="admin_level_1"
        />
        <TextField
          {...register("city", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.city}
          helperText={(errors as any)?.city?.message}
          margin="normal"
          fullWidth
          label="City"
          name="city"
        />
        <TextField
          {...register("admin_level_3", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.admin_level_3}
          helperText={(errors as any)?.admin_level_3?.message}
          margin="normal"
          fullWidth
          label="Admin Level 3 (Area)"
          name="admin_level_3"
        />
        <TextField
          {...register("latitude", {
            required: "This field is required",
            valueAsNumber: true,
          })}
          error={!!(errors as any)?.latitude}
          helperText={(errors as any)?.latitude?.message}
          margin="normal"
          fullWidth
          label="Latitude"
          name="latitude"
          type="number"
        />
        <TextField
          {...register("longitude", {
            required: "This field is required",
            valueAsNumber: true,
          })}
          error={!!(errors as any)?.longitude}
          helperText={(errors as any)?.longitude?.message}
          margin="normal"
          fullWidth
          label="Longitude"
          name="longitude"
          type="number"
        />
        <FormControlLabel
          control={
            <Checkbox
              {...register("is_active")}
            />
          }
          label="Is Active"
        />
      </Box>
    </Edit>
  );
};