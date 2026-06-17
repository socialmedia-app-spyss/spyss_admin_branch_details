import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, FormHelperText } from "@mui/material";
import { Event } from "../../types/event"; // Assuming you have an Event type
import { Controller } from "react-hook-form"; // Import Controller

export const EventCreate = () => {
  const { saveButtonProps, register, formState: { errors }, control } = useForm<Event>({
    defaultValues: {
      is_active: true, // Default to active for create
    }
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("event_name", {
            required: "Event Name is required",
          })}
          label="Event Name *"
          fullWidth
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
          error={!!errors.full_description}
          helperText={(errors.full_description && String(errors.full_description.message)) || "A detailed description of the event. (Mandatory)"}
        />

        <TextField
          {...register("start_datetime")}
          label="Start Date & Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.start_datetime}
          helperText={(errors.start_datetime && String(errors.start_datetime.message)) || "The date and time when the event begins. (Optional)"}
        />

        <TextField
          {...register("end_datetime")}
          label="End Date & Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.end_datetime}
          helperText={(errors.end_datetime && String(errors.end_datetime.message)) || "The date and time when the event ends. (Optional)"}
        />

        <TextField
          {...register("location", {
            required: "Location is required",
          })}
          label="Location *"
          fullWidth
          error={!!errors.location}
          helperText={(errors.location && String(errors.location.message)) || "The physical or virtual location of the event. (Mandatory)"}
        />

        <TextField
          {...register("registration_link")}
          label="Registration Link"
          fullWidth
          error={!!errors.registration_link}
          helperText={(errors.registration_link && String(errors.registration_link.message)) || "A URL for event registration. (Optional)"}
        />

        <TextField
          {...register("image_url")}
          label="Image URL"
          fullWidth
          error={!!errors.image_url}
          helperText={(errors.image_url && String(errors.image_url.message)) || "A URL for the event's image, a source image with dimensions like 1280x720px or 1920x1080px (Full HD) would be ideal. (Optional)"}
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
            {(errors.is_active && String(errors.is_active.message)) || "Toggle to make the event active or inactive. (Optional)"}
          </FormHelperText>
        </FormControl>
      </Box>
    </Create>
  );
};