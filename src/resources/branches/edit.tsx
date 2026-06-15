import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { TextField, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Box, FormHelperText } from "@mui/material";
import { Branch } from "../../types/branch";

export const BranchEdit = () => {
  const { saveButtonProps, register, formState: { errors }, control } = useForm<Branch>();

  const timeFormatRegex = /^\d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)$/;
  const categoryRegex = /^[A-Z\s]*$/; // Regex for uppercase letters and spaces

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
            helperText={(errors.branch_name && String(errors.branch_name.message)) || "The name of the branch. (Mandatory)"}
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
          helperText={(errors.address && String(errors.address.message)) || "The full address of the branch. (Mandatory)"}
        />
        <TextField
          {...register("country_code_or_name", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Country Code/Name"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.country_code_or_name}
          helperText={(errors.country_code_or_name && String(errors.country_code_or_name.message)) || "The country code or name where the branch is located (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("admin_level_1", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Admin Level 1 (State)"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.admin_level_1}
          helperText={(errors.admin_level_1 && String(errors.admin_level_1.message)) || "The state or first-level administrative division (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("city", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="City"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.city}
          helperText={(errors.city && String(errors.city.message)) || "The city where the branch is located (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("admin_level_3", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Admin Level 3 (Area)"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.admin_level_3}
          helperText={(errors.admin_level_3 && String(errors.admin_level_3.message)) || "The area or third-level administrative division (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("latitude", {
            required: "This field is required",
            valueAsNumber: true,
            validate: (value) =>
              (value >= -90 && value <= 90) || "Latitude must be between -90 and 90",
          })}
          label="Latitude"
          fullWidth
          margin="normal"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ // Added inputProps
            step: "any",
          }}
          error={!!errors.latitude}
          helperText={(errors.latitude && String(errors.latitude.message)) || "The geographical latitude of the branch (between -90 and 90). (Mandatory)"}
        />
        <TextField
          {...register("longitude", {
            required: "This field is required",
            valueAsNumber: true,
            validate: (value) =>
              (value >= -180 && value <= 180) || "Longitude must be between -180 and 180",
          })}
          label="Longitude"
          fullWidth
          margin="normal"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ // Added inputProps
            step: "any",
          }}
          error={!!errors.longitude}
          helperText={(errors.longitude && String(errors.longitude.message)) || "The geographical longitude of the branch (between -180 and 180). (Mandatory)"}
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
          helperText={(errors.mukhyashikshak_name && String(errors.mukhyashikshak_name.message)) || "The name of the Mukhyashikshak for this branch. (Mandatory)"}
        />
        <TextField
          {...register("class_timings", {
            required: "This field is required",
            pattern: {
              value: timeFormatRegex,
              message: "Format: 6:30 PM - 7:30 PM",
            },
          })}
          label="Class Timings"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.class_timings}
          helperText={(errors.class_timings && String(errors.class_timings.message)) || "The schedule or timings for classes at this branch (e.g., 6:30 PM - 7:30 PM). (Mandatory)"}
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
          helperText={(errors.contact_no && String(errors.contact_no.message)) || "The contact number for the branch. (Mandatory)"}
        />
        <TextField
          {...register("category", {
            required: "This field is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
            maxLength: { value: 20, message: "Maximum 20 characters" },
            pattern: {
              value: categoryRegex,
              message: "Category must be in uppercase letters only",
            },
          })}
          label="Category"
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.category}
          helperText={(errors.category && String(errors.category.message)) || "The category of the branch (e.g., GENERAL, PROFESSIONAL). Must be 3-20 uppercase letters. (Mandatory)"}
        />

        <FormControl fullWidth margin="normal" error={!!errors.batch}>
          <InputLabel id="batch-label">Batch</InputLabel>
          <Controller
            name="batch"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="batch-label"
                label="Batch"
                value={field.value || ""} // Ensure value is a string
              >
                <MenuItem value="MORNING">MORNING</MenuItem>
                <MenuItem value="AFTERNOON">AFTERNOON</MenuItem>
                <MenuItem value="EVENING">EVENING</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>
            {(errors.batch && String(errors.batch.message)) || "The batch timing for classes at this branch. (Mandatory)"}
          </FormHelperText>
        </FormControl>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={!!field.value} // Ensure checked is a boolean
                  onChange={(e) => field.onChange(e.target.checked)} // Pass boolean value
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
          )}
        />
        <FormHelperText>
          (Optional). Toggle to make the branch active or inactive.
        </FormHelperText>
      </Box>
    </Edit>
  );
};