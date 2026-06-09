import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Box } from "@mui/material";
import { Branch } from "../../types/branch"; // Import the Branch type

export const BranchEdit = () => {
  const { saveButtonProps, register, formState: { errors }, watch } = useForm<Branch>(); // Destructure watch

  const is_active = watch("is_active"); // Watch the value of is_active
  const batch = watch("batch"); // Watch the value of batch

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
            {...register("branch_name", {
              required: "This field is required",
            })}
            label="Branch Name"
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            error={!!errors.branch_name}
            helperText={errors.branch_name && String(errors.branch_name.message)}
        />
        <TextField
          {...register("address", { required: "This field is required" })}
          label="Address"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.address}
          helperText={errors.address && String(errors.address.message)}
        />
        <TextField
          {...register("country_code_or_name", { required: "This field is required" })}
          label="Country Code/Name"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.country_code_or_name}
          helperText={errors.country_code_or_name && String(errors.country_code_or_name.message)}
        />
        <TextField
          {...register("admin_level_1", { required: "This field is required" })}
          label="Admin Level 1 (State)"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.admin_level_1}
          helperText={errors.admin_level_1 && String(errors.admin_level_1.message)}
        />
        <TextField
          {...register("city", { required: "This field is required" })}
          label="City"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.city}
          helperText={errors.city && String(errors.city.message)}
        />
        <TextField
          {...register("admin_level_3", { required: "This field is required" })}
          label="Admin Level 3 (Area)"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.admin_level_3}
          helperText={errors.admin_level_3 && String(errors.admin_level_3.message)}
        />
        <TextField
          {...register("latitude", { required: "This field is required", valueAsNumber: true })}
          label="Latitude"
          fullWidth
          margin="normal"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.latitude}
          helperText={errors.latitude && String(errors.latitude.message)}
        />
        <TextField
          {...register("longitude", { required: "This field is required", valueAsNumber: true })}
          label="Longitude"
          fullWidth
          margin="normal"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.longitude}
          helperText={errors.longitude && String(errors.longitude.message)}
        />
        <TextField
          {...register("mukhyashikshak_name", { required: "This field is required" })}
          label="Mukhyashikshak Name"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.mukhyashikshak_name}
          helperText={errors.mukhyashikshak_name && String(errors.mukhyashikshak_name.message)}
        />
        <TextField
          {...register("class_timings", { required: "This field is required" })}
          label="Class Timings"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.class_timings}
          helperText={errors.class_timings && String(errors.class_timings.message)}
        />
        <TextField
          {...register("contact_no", { required: "This field is required" })}
          label="Contact No"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.contact_no}
          helperText={errors.contact_no && String(errors.contact_no.message)}
        />
        <TextField
          {...register("category", { required: "This field is required" })}
          label="Category"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.category}
          helperText={errors.category && String(errors.category.message)}
        />

        <FormControl fullWidth margin="normal" error={!!errors.batch}>
          <InputLabel id="batch-label">Batch</InputLabel>
          <Select
            labelId="batch-label"
            {...register("batch", { required: "This field is required" })}
            label="Batch"
            value={batch || ""} // Explicitly set value from watch
          >
            <MenuItem value="MORNING">MORNING</MenuItem>
            <MenuItem value="AFTERNOON">AFTERNOON</MenuItem>
            <MenuItem value="EVENING">EVENING</MenuItem>
          </Select>
          {errors.batch && <p style={{ color: 'red' }}>{String(errors.batch.message)}</p>}
        </FormControl>

        <FormControlLabel
          control={<Switch {...register("is_active")} checked={!!is_active} />} // Explicitly set checked from watch
          label="Active"
          sx={{ mt: 2 }}
        />
      </Box>
    </Edit>
  );
};