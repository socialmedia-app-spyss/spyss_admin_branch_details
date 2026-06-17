import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { TextField, Box, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, FormHelperText } from "@mui/material";
import { Event } from "../../types/event";

// Helper function to format date for datetime-local input
const formatDateTimeLocal = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EventEdit = () => {
  const { saveButtonProps, register, formState: { errors }, control } = useForm<Event>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("event_name", {
            required: "Event Name is required",
          })}
          label="Event Name *"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.event_name}
          helperText={(errors.event_name && String(errors.event_name.message)) || "The name of the event. (Mandatory)"}
        />

        <TextField
          {...register("short_description", {
            required: "Short Description is required",
          })}
          label="Short Description *"
          multiline
          rows={2}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.short_description}
          helperText={(errors.short_description && String(errors.short_description.message)) || "A brief summary of the event. (Mandatory)"}
        />

        <TextField
          {...register("full_description", {
            required: "Full Description is required",
          })}
          label="Full Description *"
          multiline
          rows={6}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.full_description}
          helperText={(errors.full_description && String(errors.full_description.message)) || "A detailed description of the event. (Mandatory)"}
        />

        {/* Start Date & Time */}
        <Controller
          name="start_datetime"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Start Date & Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formatDateTimeLocal(field.value)}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : new Date(e.target.value).toISOString())}
              error={!!errors.start_datetime}
              helperText={(errors.start_datetime && String(errors.start_datetime.message)) || "The date and time when the event begins. (Optional)"}
            />
          )}
        />

        {/* End Date & Time */}
        <Controller
          name="end_datetime"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="End Date & Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formatDateTimeLocal(field.value)}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : new Date(e.target.value).toISOString())}
              error={!!errors.end_datetime}
              helperText={(errors.end_datetime && String(errors.end_datetime.message)) || "The date and time when the event ends. (Optional)"}
            />
          )}
        />

        <TextField
          {...register("location", {
            required: "Location is required",
          })}
          label="Location *"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.location}
          helperText={(errors.location && String(errors.location.message)) || "The physical or virtual location of the event. (Mandatory)"}
        />

        <TextField
          {...register("registration_link")}
          label="Registration Link"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.registration_link}
          helperText={(errors.registration_link && String(errors.registration_link.message)) || "A URL for event registration. (Optional)"}
        />

        <TextField
          {...register("image_url")}
          label="Image URL"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.image_url}
          helperText={(errors.image_url && String(errors.image_url.message)) || "A URL for the event's image,a source image with dimensions like 1280x720px or 1920x1080px (Full HD) would be ideal. (Optional)"}
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
                    checked={!!field.value} // Ensure checked is a boolean
                    onChange={(e) => field.onChange(e.target.checked)} // Pass boolean value
                  />
                }
                label="Active"
              />
            )}
          />
          <FormHelperText>
            {(errors.is_active && String(errors.is_active.message)) || "Toggle to make the event active or inactive. (Optional)"}
          </FormHelperText>
        </FormControl>
      </Box>
    </Edit>
  );
};