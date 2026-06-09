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
          {...register("title", { required: "This field is required" })}
          label="Title"
          fullWidth
          error={!!errors.title}
          helperText={errors.title && String(errors.title.message)}
        />
        <TextField
          {...register("message", { required: "This field is required" })}
          label="Message"
          multiline
          rows={4}
          fullWidth
          error={!!errors.message}
          helperText={errors.message && String(errors.message.message)}
        />
        <FormControl fullWidth error={!!errors.target_role}>
          <InputLabel id="target-role-label">Target Role</InputLabel>
          <Select
            labelId="target-role-label"
            {...register("target_role", { required: "This field is required" })}
            defaultValue="ALL"
            label="Target Role"
          >
            <MenuItem value="ALL">All Users</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
            <MenuItem value="SUPER_ADMIN">Super Admins</MenuItem>
            <MenuItem value="USER">Regular Users</MenuItem>
          </Select>
          {errors.target_role && <p style={{ color: 'red' }}>{String(errors.target_role.message)}</p>}
        </FormControl>
        <FormControl fullWidth error={!!errors.status}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            {...register("status", { required: "This field is required" })}
            defaultValue="DRAFT"
            label="Status"
          >
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
          </Select>
          {errors.status && <p style={{ color: 'red' }}>{String(errors.status.message)}</p>}
        </FormControl>
      </Box>
    </Create>
  );
};
