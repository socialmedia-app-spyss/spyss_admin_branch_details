import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Event } from "../../types/event"; // Assuming you have an Event type

export const EventCreate = () => {
  const { saveButtonProps, register, formState: { errors } } = useForm<Event>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("event_name", {
            required: "Event Name is required",
          })}
          label="Event Name"
          fullWidth
          error={!!errors.event_name}
          helperText={errors.event_name && String(errors.event_name.message)}
        />

        <TextField
          {...register("short_description", {
            required: "Short Description is required",
          })}
          label="Short Description"
          multiline
          rows={2}
          fullWidth
          error={!!errors.short_description}
          helperText={errors.short_description && String(errors.short_description.message)}
        />

        <TextField
          {...register("full_description", {
            required: "Full Description is required",
          })}
          label="Full Description"
          multiline
          rows={6}
          fullWidth
          error={!!errors.full_description}
          helperText={errors.full_description && String(errors.full_description.message)}
        />

        <TextField
          {...register("start_datetime")}
          label="Start Date & Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.start_datetime}
          helperText={errors.start_datetime && String(errors.start_datetime.message)}
        />

        <TextField
          {...register("end_datetime")}
          label="End Date & Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.end_datetime}
          helperText={errors.end_datetime && String(errors.end_datetime.message)}
        />

        <TextField
          {...register("location", {
            required: "Location is required",
          })}
          label="Location"
          fullWidth
          error={!!errors.location}
          helperText={errors.location && String(errors.location.message)}
        />

        <TextField
          {...register("registration_link")}
          label="Registration Link"
          fullWidth
          error={!!errors.registration_link}
          helperText={errors.registration_link && String(errors.registration_link.message)}
        />

        <TextField
          {...register("image_url")}
          label="Image URL"
          fullWidth
          error={!!errors.image_url}
          helperText={errors.image_url && String(errors.image_url.message)}
        />

        <FormControl fullWidth error={!!errors.is_active}>
          <InputLabel id="is-active-label">Active</InputLabel>
          <Select
            labelId="is-active-label"
            defaultValue="true"
            {...register("is_active")}
            label="Active"
          >
            <MenuItem value="true">
              Active
            </MenuItem>

            <MenuItem value="false">
              Inactive
            </MenuItem>
          </Select>
          {errors.is_active && <p style={{ color: 'red' }}>{String(errors.is_active.message)}</p>}
        </FormControl>
      </Box>
    </Create>
  );
};