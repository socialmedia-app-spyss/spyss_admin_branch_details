import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form"; // Corrected import for Controller
import { TextField, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Notification } from "../../types/notification"; // Assuming you have a Notification type

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

export const NotificationEdit = () => {
  const { saveButtonProps, register, formState: { errors }, control } = useForm<Notification>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("title", { required: "Title is required" })}
          label="Title"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.title}
          helperText={errors.title && String(errors.title.message)}
        />
        <TextField
          {...register("body", { required: "Body is required" })}
          label="Body"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.body}
          helperText={errors.body && String(errors.body.message)}
        />
        <FormControl fullWidth margin="normal" error={!!errors.priority}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Controller
            name="priority"
            control={control}
            rules={{ required: "Priority is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="priority-label"
                label="Priority"
                value={field.value || ""}
              >
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="NORMAL">NORMAL</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="URGENT">URGENT</MenuItem>
              </Select>
            )}
          />
          {errors.priority && <p style={{ color: 'red' }}>{String(errors.priority.message)}</p>}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.type}>
          <InputLabel id="type-label">Type</InputLabel>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="type-label"
                label="Type"
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
          {errors.type && <p style={{ color: 'red' }}>{String(errors.type.message)}</p>}
        </FormControl>
        {/* Date Time */}
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
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : new Date(e.target.value).toISOString())}
              error={!!errors.date_time}
              helperText={errors.date_time && String(errors.date_time.message)}
            />
          )}
        />
        {/* Expiry Date */}
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
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : new Date(e.target.value).toISOString())}
              error={!!errors.expiry_date}
              helperText={errors.expiry_date && String(errors.expiry_date.message)}
            />
          )}
        />
        <FormControl fullWidth margin="normal" error={!!errors.is_active}>
          <InputLabel id="is-active-label">Active</InputLabel>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="is-active-label"
                label="Active"
                value={field.value === true ? "true" : "false"}
                onChange={(e) => field.onChange(e.target.value === "true")}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            )}
          />
          {errors.is_active && <p style={{ color: 'red' }}>{String(errors.is_active.message)}</p>}
        </FormControl>
      </Box>
    </Edit>
  );
};