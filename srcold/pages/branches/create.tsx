import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormHelperText, // Added FormHelperText
} from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form"; // Added Controller

export const BranchCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    saveButtonProps, // Added saveButtonProps
    register,
    formState: { errors },
    control, // Keep control for Controller
  } = useForm();

  const categoryOptions = ['GENERAL', 'WOMEN', 'PROFESSIONAL', 'YOUTH', 'CHILDREN']; // Corrected
  const batchOptions = ['MORNING', 'AFTERNOON', 'EVENING'];

  return (
    <Create saveButtonProps={saveButtonProps}> {/* Passed saveButtonProps */}
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
          autoFocus
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
          <Controller
            control={control}
            name="category"
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="category-label"
                label="Category"
                defaultValue=""
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {!!(errors as any)?.category && (
            <FormHelperText error>
              {(errors as any)?.category?.message}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl margin="normal" fullWidth error={!!(errors as any)?.batch}>
          <InputLabel id="batch-label">Batch</InputLabel>
          <Controller
            control={control}
            name="batch"
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="batch-label"
                label="Batch"
                defaultValue=""
              >
                {batchOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {!!(errors as any)?.batch && (
            <FormHelperText error>
              {(errors as any)?.batch?.message}
            </FormHelperText>
          )}
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
          label="Is Active"
          control={
            <Controller
              name="is_active"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Checkbox
                  inputRef={ref}
                  checked={!!value} // Ensure boolean value
                  onChange={onChange}
                />
              )}
            />
          }
        />
      </Box>
    </Create>
  );
};