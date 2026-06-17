import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { TextField, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Box, FormHelperText, Grid, Typography } from "@mui/material";
import { Branch } from "../../types/branch";
import { useState, useEffect } from "react";

// Helper function to convert HH:MM AM/PM to minutes from midnight
const convertToMinutes = (hour: string, minute: string, ampm: string): number => {
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);

  if (ampm === "PM" && h !== 12) {
    h += 12;
  } else if (ampm === "AM" && h === 12) {
    h = 0; // 12 AM is 0 hours
  }
  return h * 60 + m;
};

// Helper function to determine batch from start time
const getBatchFromStartTime = (hour: string, minute: string, ampm: string): string => {
  if (!hour || !minute || !ampm) return "";

  let h24 = parseInt(hour, 10);
  const m = parseInt(minute, 10);

  if (ampm === "PM" && h24 !== 12) {
    h24 += 12;
  } else if (ampm === "AM" && h24 === 12) {
    h24 = 0; // 12 AM is 0 hours
  }

  // Convert to a single comparable number (e.g., 200 for 2:00 AM, 1059 for 10:59 AM)
  const timeValue = h24 * 100 + m;

  if (timeValue >= 200 && timeValue <= 1059) { // 2:00 AM - 10:59 AM
    return "MORNING";
  } else if (timeValue >= 1100 && timeValue <= 1559) { // 11:00 AM - 3:59 PM (15:59)
    return "AFTERNOON";
  } else if (timeValue >= 1600 && timeValue <= 1959) { // 4:00 PM - 7:59 PM (19:59)
    return "EVENING";
  } else { // 8:00 PM onwards (20:00) to 1:59 AM (1:59) - covers overnight
    return "NIGHT";
  }
};

export const BranchCreate = () => {
  const { saveButtonProps, register, formState: { errors }, control, setValue, watch } = useForm<Branch>({
    defaultValues: {
      is_active: true,
      batch: "", // Initialize batch
    }
  });

  // State for time pickers
  const [startHour, setStartHour] = useState<string>("");
  const [startMinute, setStartMinute] = useState<string>("");
  const [startAmPm, setStartAmPm] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [endMinute, setEndMinute] = useState<string>("");
  const [endAmPm, setEndAmPm] = useState<string>("");

  // Helper arrays for time options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
  const ampm = ["AM", "PM"];
  const categoryOptions = ["GENERAL", "WOMEN", "PROFESSIONAL", "YOUTH", "CHILDREN", "SENIOR_CITIZENS"]; // Updated Category options

  // Effect to combine time inputs into class_timings field and set batch
  useEffect(() => {
    if (startHour && startMinute && startAmPm && endHour && endMinute && endAmPm) {
      const formattedStartTime = `${startHour}:${startMinute} ${startAmPm}`;
      const formattedEndTime = `${endHour}:${endMinute} ${endAmPm}`;
      setValue("class_timings", `${formattedStartTime} - ${formattedEndTime}`, { shouldValidate: true });

      const calculatedBatch = getBatchFromStartTime(startHour, startMinute, startAmPm);
      setValue("batch", calculatedBatch, { shouldValidate: true });
    } else {
      setValue("class_timings", "", { shouldValidate: true });
      setValue("batch", "", { shouldValidate: true }); // Clear batch if times are incomplete
    }
  }, [startHour, startMinute, startAmPm, endHour, endMinute, endAmPm, setValue]);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("branch_name", { required: "This field is required" })}
          label="Branch Name *"
          fullWidth
          error={!!errors.branch_name}
          helperText={(errors.branch_name && String(errors.branch_name.message)) || "The name of the branch. (Mandatory)"}
        />
        <TextField
          {...register("address", { required: "This field is required" })}
          label="Address *"
          fullWidth
          error={!!errors.address}
          helperText={(errors.address && String(errors.address.message)) || "The full address of the branch. (Mandatory)"}
        />
        <TextField
          {...register("country_code_or_name", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Country Code/Name *"
          fullWidth
          error={!!errors.country_code_or_name}
          helperText={(errors.country_code_or_name && String(errors.country_code_or_name.message)) || "The country code or name where the branch is located (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("admin_level_1", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Admin Level 1 (State) *"
          fullWidth
          error={!!errors.admin_level_1}
          helperText={(errors.admin_level_1 && String(errors.admin_level_1.message)) || "The state or first-level administrative division (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("city", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="City *"
          fullWidth
          error={!!errors.city}
          helperText={(errors.city && String(errors.city.message)) || "The city where the branch is located (2-30 characters). (Mandatory)"}
        />
        <TextField
          {...register("admin_level_3", {
            required: "This field is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          })}
          label="Admin Level 3 (Area) *"
          fullWidth
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
          label="Latitude *"
          fullWidth
          type="number"
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
          label="Longitude *"
          fullWidth
          type="number"
          error={!!errors.longitude}
          helperText={(errors.longitude && String(errors.longitude.message)) || "The geographical longitude of the branch (between -180 and 180). (Mandatory)"}
        />
        <TextField
          {...register("mukhyashikshak_name", { required: "This field is required" })}
          label="Mukhyashikshak Name *"
          fullWidth
          error={!!errors.mukhyashikshak_name}
          helperText={(errors.mukhyashikshak_name && String(errors.mukhyashikshak_name.message)) || "The name of the Mukhyashikshak for this branch. (Mandatory)"}
        />
        <TextField
          {...register("contact_no", {
            required: "This field is required",
            minLength: { value: 10, message: "Contact number must be at least 10 digits" },
          })}
          label="Contact No *"
          fullWidth
          error={!!errors.contact_no}
          helperText={(errors.contact_no && String(errors.contact_no.message)) || "The contact number for the branch (minimum 10 digits). (Mandatory)"}
        />
        
        {/* Category Select */}
        <FormControl fullWidth margin="normal" error={!!errors.category}>
          <InputLabel id="category-label">Category *</InputLabel>
          <Controller
            name="category"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="category-label"
                label="Category *"
                value={field.value || ""}
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        {/* Class Timings Input */}
        <FormControl fullWidth margin="normal" error={!!errors.class_timings}>
          <Typography variant="body1" sx={{ mb: 1 }}>Class Timings *</Typography>
          <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={3}>
                <Typography variant="subtitle2">Start Time:</Typography>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>HH</InputLabel>
                  <Select value={startHour} label="HH" onChange={(e) => setStartHour(e.target.value as string)}>
                    {hours.map((hour) => (
                      <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>MM</InputLabel>
                  <Select value={startMinute} label="MM" onChange={(e) => setStartMinute(e.target.value as string)}>
                    {minutes.map((minute) => (
                      <MenuItem key={minute} value={minute}>{minute}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>AM/PM</InputLabel>
                  <Select value={startAmPm} label="AM/PM" onChange={(e) => setStartAmPm(e.target.value as string)}>
                    {ampm.map((period) => (
                      <MenuItem key={period} value={period}>{period}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography variant="subtitle2">End Time:</Typography>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>HH</InputLabel>
                  <Select value={endHour} label="HH" onChange={(e) => setEndHour(e.target.value as string)}>
                    {hours.map((hour) => (
                      <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>MM</InputLabel>
                  <Select value={endMinute} label="MM" onChange={(e) => setEndMinute(e.target.value as string)}>
                    {minutes.map((minute) => (
                      <MenuItem key={minute} value={minute}>{minute}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>AM/PM</InputLabel>
                  <Select value={endAmPm} label="AM/PM" onChange={(e) => setEndAmPm(e.target.value as string)}>
                    {ampm.map((period) => (
                      <MenuItem key={period} value={period}>{period}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              {...register("class_timings", {
                required: "Class Timings is required",
                validate: () => {
                  if (!startHour || !startMinute || !startAmPm || !endHour || !endMinute || !endAmPm) {
                    return "All start and end time components must be selected.";
                  }
                  const startTimeInMinutes = convertToMinutes(startHour, startMinute, startAmPm);
                  const endTimeInMinutes = convertToMinutes(endHour, endMinute, endAmPm);

                  if (endTimeInMinutes <= startTimeInMinutes) {
                    return "End time must be greater than start time.";
                  }
                  return true;
                }
              })}
              label="Final Class Timings *"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={watch("class_timings") || ""}
              InputProps={{ readOnly: true }}
              error={!!errors.class_timings}
              helperText={(errors.class_timings && String(errors.class_timings.message)) || "The schedule or timings for classes at this branch (e.g., 06:30 PM - 07:30 PM). End time must be greater than start time. (Mandatory)"}
            />
          </Box>
        </FormControl>

        {/* Display Calculated Batch */}
        <TextField
          label="Calculated Batch"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={watch("batch") || ""}
          InputProps={{ readOnly: true }}
          helperText="The batch is automatically determined by the start time of the class timings. (Mandatory)"
        />

        {/* Active Switch */}
        <FormControl fullWidth margin="normal" error={!!errors.is_active}>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value === true} // Ensure boolean value for checked
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Active"
              />
            )}
          />
          <FormHelperText>
            {(errors.is_active && String(errors.is_active.message)) || "Toggle to make the branch active or inactive. (Optional)"}
          </FormHelperText>
        </FormControl>
      </Box>
    </Create>
  );
};