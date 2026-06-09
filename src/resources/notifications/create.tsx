import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Notification } from "../../types/notification"; // Assuming you have a Notification type

export const NotificationCreate = () => {
  const { saveButtonProps, register, formState: { errors } } = useForm<Notification>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("title", { required: "Title is required" })}
          label="Title"
          fullWidth
          error={!!errors.title}
          helperText={errors.title && String(errors.title.message)}
        />
        <TextField
          {...register("body", { required: "Body is required" })}
          label="Body"
          multiline
          rows={4}
          fullWidth
          error={!!errors.body}
          helperText={errors.body && String(errors.body.message)}
        />
        <FormControl fullWidth error={!!errors.priority}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            defaultValue="NORMAL"
            {...register("priority", { required: "Priority is required" })}
            label="Priority"
          >
            <MenuItem value="LOW">LOW</MenuItem>
            <MenuItem value="NORMAL">NORMAL</MenuItem>
            <MenuItem value="HIGH">HIGH</MenuItem>
            <MenuItem value="URGENT">URGENT</MenuItem>
          </Select>
          {errors.priority && <p style={{ color: 'red' }}>{String(errors.priority.message)}</p>}
        </FormControl>
        <FormControl fullWidth error={!!errors.type}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            defaultValue="GENERAL"
            {...register("type", { required: "Type is required" })}
            label="Type"
          >
            <MenuItem value="GENERAL">GENERAL</MenuItem>
            <MenuItem value="EVENT">EVENT</MenuItem>
            <MenuItem value="BRANCH">BRANCH</MenuItem>
            <MenuItem value="ANNOUNCEMENT">ANNOUNCEMENT</MenuItem>
            <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
          </Select>
          {errors.type && <p style={{ color: 'red' }}>{String(errors.type.message)}</p>}
        </FormControl>
        <TextField
          {...register("date_time")}
          type="datetime-local"
          label="Date Time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.date_time}
          helperText={errors.date_time && String(errors.date_time.message)}
        />
        <TextField
          {...register("expiry_date")}
          type="datetime-local"
          label="Expiry Date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.expiry_date}
          helperText={errors.expiry_date && String(errors.expiry_date.message)}
        />
        <FormControl fullWidth error={!!errors.is_active}>
          <InputLabel id="is-active-label">Active</InputLabel>
          <Select
            labelId="is-active-label"
            defaultValue="true"
            {...register("is_active", { required: "Active status is required" })}
            label="Active"
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
          {errors.is_active && <p style={{ color: 'red' }}>{String(errors.is_active.message)}</p>}
        </FormControl>
      </Box>
    </Create>
  );
};