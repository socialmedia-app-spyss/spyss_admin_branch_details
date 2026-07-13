import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type { NotificationInput } from "../../types/notification";

type Props = {
  register: UseFormRegister<NotificationInput>;
  control: Control<NotificationInput>;
  errors: FieldErrors<NotificationInput>;
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const NotificationForm = ({ register, control, errors }: Props) => (
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth error={!!errors.priority}>
        <InputLabel id="notification-priority-label">Priority *</InputLabel>
        <Controller
          name="priority"
          control={control}
          rules={{ required: "Priority is required." }}
          render={({ field }) => (
            <Select {...field} labelId="notification-priority-label" label="Priority *">
              {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </Select>
          )}
        />
        <FormHelperText>{errors.priority?.message}</FormHelperText>
      </FormControl>
    </Grid>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth error={!!errors.type}>
        <InputLabel id="notification-type-label">Type *</InputLabel>
        <Controller
          name="type"
          control={control}
          rules={{ required: "Type is required." }}
          render={({ field }) => (
            <Select {...field} labelId="notification-type-label" label="Type *">
              {['GENERAL', 'EVENT', 'BRANCH', 'ANNOUNCEMENT', 'EMERGENCY'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </Select>
          )}
        />
        <FormHelperText>{errors.type?.message}</FormHelperText>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField {...register("title_en", { required: "English title is required.", maxLength: { value: 200, message: "Title must be 200 characters or fewer." } })}
        label="Title (English) *" fullWidth error={!!errors.title_en} helperText={errors.title_en?.message} />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...register("title_kn", { maxLength: { value: 200, message: "Title must be 200 characters or fewer." } })}
        label="ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)" fullWidth error={!!errors.title_kn} helperText={errors.title_kn?.message || "Optional"} />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...register("body_en", { required: "English body is required." })}
        label="Body (English) *" fullWidth multiline minRows={5} error={!!errors.body_en} helperText={errors.body_en?.message} />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...register("body_kn")}
        label="ವಿವರ (ಕನ್ನಡ)" fullWidth multiline minRows={5} error={!!errors.body_kn} helperText={errors.body_kn?.message || "Optional"} />
    </Grid>

    <Grid item xs={12} md={6}>
      <Controller name="date_time" control={control} render={({ field }) => (
        <TextField {...field} value={toDateTimeLocal(field.value)} onChange={(event) => field.onChange(event.target.value)}
          label="Publish Date and Time" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }}
          helperText="Optional. Leave blank to publish immediately." />
      )} />
    </Grid>
    <Grid item xs={12} md={6}>
      <Controller name="expiry_date" control={control} render={({ field }) => (
        <TextField {...field} value={toDateTimeLocal(field.value)} onChange={(event) => field.onChange(event.target.value)}
          label="Expiry Date and Time" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }}
          helperText="Optional. The database requires expiry to be after creation." />
      )} />
    </Grid>
    <Grid item xs={12}>
      <Controller name="is_active" control={control} render={({ field }) => (
        <FormControlLabel control={<Checkbox checked={field.value ?? true} onChange={(_, checked) => field.onChange(checked)} />}
          label="Active" />
      )} />
    </Grid>
  </Grid>
);
