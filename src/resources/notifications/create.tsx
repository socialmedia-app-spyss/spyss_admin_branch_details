import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { TextField, Box, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, FormHelperText } from "@mui/material";
import { Notification } from "../../types/notification";

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

export const NotificationCreate = () => {
  const { saveButtonProps, register, formState: { errors }, control } = useForm<Notification>({
    defaultValues: {
      priority: "NORMAL",
      type: "GENERAL",
      is_active: true, // Default to active for create
    }
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("title", { required: "Title is required" })}
          label="Title *"
          fullWidth
          margin="normal"
          error={!!errors.title}
          helperText={(errors.title && String(errors.title.message)) || "The main heading or subject of the notification. (Mandatory)"}
        />
        <TextField
          {...register("body", { required: "Body is required" })}
          label="Body *"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          error={!!errors.body}
          helperText={(errors.body && String(errors.body.message)) || "The detailed content or message of the notification. (Mandatory)"}
        />
        <FormControl fullWidth margin="normal" error={!!errors.priority}>
          <InputLabel id="priority-label">Priority *</InputLabel>
          <Controller
            name="priority"
            control={control}
            rules={{ required: "Priority is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="priority-label"
                label="Priority *"
                value={field.value || ""}
              >
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="NORMAL">NORMAL</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="URGENT">URGENT</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>
            {(errors.priority && String(errors.priority.message)) || "Indicates the urgency or importance of the notification. (Mandatory)"}
          </FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.type}>
          <InputLabel id="type-label">Type *</InputLabel>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="type-label"
                label="Type *"
                value={field.value || ""}
              >
                <MenuItem value="GENERAL">GENERAL</MenuItem>
                <MenuItem value="EVENT">EVENT</MenuItem>
                <MenuItem value="BRANCH">BRANCH</MenuItem>
                <MenuItem value="ANNOUNCEMENT">ANNOUNCEMENT</MenuItem>
                <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>
            {(errors.type && String(errors.type.message)) || "Categorizes the notification. (Mandatory)"}
          </FormHelperText>
        </FormControl>

        {/* Date Time Field (always visible) */}
        <Controller
          name="date_time"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Date Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formatDateTimeLocal(field.value)}
              onChange={(e) => field.onChange(e.target.value === "" ? null : new Date(e.target.value).toISOString())}
              error={!!errors.date_time}
              helperText={(errors.date_time && String(errors.date_time.message)) || "Specifies the exact date and time when the notification should be sent or become active. (Optional)"}
            />
          )}
        />

        {/* Expiry Date Field (always visible) */}
        <Controller
          name="expiry_date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Expiry Date"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formatDateTimeLocal(field.value)}
              onChange={(e) => field.onChange(e.target.value === "" ? null : new Date(e.target.value).toISOString())}
              error={!!errors.expiry_date}
              helperText={(errors.expiry_date && String(errors.expiry_date.message)) || "Sets the date and time after which the notification will no longer be active or displayed. (Optional)"}
            />
          )}
        />

        {/* is_active Switch */}
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
            {(errors.is_active && String(errors.is_active.message)) || "A toggle to enable or disable the notification. (Optional)"}
          </FormHelperText>
        </FormControl>
      </Box>
    </Create>
  );
};