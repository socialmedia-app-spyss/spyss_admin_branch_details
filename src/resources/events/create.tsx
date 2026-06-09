import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box } from "@mui/material";
import { Event } from "../../types/event"; // Assuming you have an Event type

export const EventCreate = () => {
  const { saveButtonProps, register, formState: { errors } } = useForm<Event>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          {...register("name", { required: "This field is required" })}
          label="Event Name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name && String(errors.name.message)}
        />
        <TextField
          {...register("description", { required: "This field is required" })}
          label="Description"
          multiline
          rows={4}
          fullWidth
          error={!!errors.description}
          helperText={errors.description && String(errors.description.message)}
        />
        <TextField
          {...register("start_date", { required: "This field is required" })}
          label="Start Date"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.start_date}
          helperText={errors.start_date && String(errors.start_date.message)}
        />
        <TextField
          {...register("end_date", { required: "This field is required" })}
          label="End Date"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.end_date}
          helperText={errors.end_date && String(errors.end_date.message)}
        />
        <TextField
          {...register("location", { required: "This field is required" })}
          label="Location"
          fullWidth
          error={!!errors.location}
          helperText={errors.location && String(errors.location.message)}
        />
      </Box>
    </Create>
  );
};
