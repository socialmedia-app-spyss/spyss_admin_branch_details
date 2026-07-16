import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
} from "react-hook-form";
import type { EventInput } from "../../types/event";

type EventFormProps = {
  register: UseFormRegister<EventInput>;
  control: Control<EventInput>;
  errors: FieldErrors<EventInput>;
  getValues: UseFormGetValues<EventInput>;
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const isValidOptionalUrl = (value?: string | null) => {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) || "Enter a valid http(s) URL.";
  } catch {
    return "Enter a valid http(s) URL.";
  }
};

const sectionSx = { p: { xs: 2, sm: 2.5 }, borderRadius: 2.5 };
const shrinkLabel = { shrink: true };

export const EventForm = ({ register, control, errors, getValues }: EventFormProps) => (
  <Stack spacing={2.5}>
    <Paper variant="outlined" sx={sectionSx}>
      <Typography variant="h6" fontWeight={700}>English content</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Required event information displayed as the primary language.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register("event_name_en", {
              required: "Event name is required.",
              maxLength: { value: 200, message: "Event name must be 200 characters or fewer." },
            })}
            label="Event Name (English) *"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.event_name_en}
            helperText={errors.event_name_en?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register("short_description_en", { required: "Short description is required." })}
            label="Short Description (English) *"
            fullWidth
            multiline
            minRows={2}
            InputLabelProps={shrinkLabel}
            error={!!errors.short_description_en}
            helperText={errors.short_description_en?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register("full_description_en", { required: "Full description is required." })}
            label="Full Description (English) *"
            fullWidth
            multiline
            minRows={5}
            InputLabelProps={shrinkLabel}
            error={!!errors.full_description_en}
            helperText={errors.full_description_en?.message}
          />
        </Grid>
      </Grid>
    </Paper>

    <Paper variant="outlined" sx={sectionSx}>
      <Typography variant="h6" fontWeight={700}>Kannada content</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Required Kannada translation of the event information.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register("event_name_kn", {
              required: "Kannada event name is required.",
              maxLength: { value: 200, message: "Event name must be 200 characters or fewer." },
            })}
            label="ಕಾರ್ಯಕ್ರಮದ ಹೆಸರು (ಕನ್ನಡ) *"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.event_name_kn}
            helperText={errors.event_name_kn?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register("short_description_kn", { required: "Kannada short description is required." })}
            label="ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (ಕನ್ನಡ) *"
            fullWidth
            multiline
            minRows={2}
            InputLabelProps={shrinkLabel}
            error={!!errors.short_description_kn}
            helperText={errors.short_description_kn?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register("full_description_kn", { required: "Kannada full description is required." })}
            label="ಪೂರ್ಣ ವಿವರಣೆ (ಕನ್ನಡ) *"
            fullWidth
            multiline
            minRows={5}
            InputLabelProps={shrinkLabel}
            error={!!errors.full_description_kn}
            helperText={errors.full_description_kn?.message}
          />
        </Grid>
      </Grid>
    </Paper>

    <Paper variant="outlined" sx={sectionSx}>
      <Typography variant="h6" fontWeight={700}>Schedule & location</Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="start_datetime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={toDateTimeLocal(field.value)}
                onChange={(event) => field.onChange(event.target.value)}
                label="Start Date and Time"
                type="datetime-local"
                fullWidth
                InputLabelProps={shrinkLabel}
                helperText="Optional"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="end_datetime"
            control={control}
            rules={{
              validate: (end) => {
                const start = getValues("start_datetime");
                return !end || !start || new Date(end) >= new Date(start) || "End time cannot be before start time.";
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                value={toDateTimeLocal(field.value)}
                onChange={(event) => field.onChange(event.target.value)}
                label="End Date and Time"
                type="datetime-local"
                fullWidth
                InputLabelProps={shrinkLabel}
                error={!!errors.end_datetime}
                helperText={errors.end_datetime?.message || "Optional"}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("location_en", { required: "English location is required." })}
            label="Location (English) *"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.location_en}
            helperText={errors.location_en?.message}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("location_kn", { required: "Kannada location is required." })}
            label="ಸ್ಥಳ (ಕನ್ನಡ) *"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.location_kn}
            helperText={errors.location_kn?.message}
          />
        </Grid>
      </Grid>
    </Paper>

    <Paper variant="outlined" sx={sectionSx}>
      <Typography variant="h6" fontWeight={700}>Links & images</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Use complete links beginning with http:// or https://.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register("registration_link", { validate: isValidOptionalUrl })}
            label="Registration Link"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.registration_link}
            helperText={errors.registration_link?.message || "Optional"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("image_url_en", { validate: isValidOptionalUrl })}
            label="English Image URL"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.image_url_en}
            helperText={errors.image_url_en?.message || "Optional"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("image_url_kn", { validate: isValidOptionalUrl })}
            label="Kannada Image URL"
            fullWidth
            InputLabelProps={shrinkLabel}
            error={!!errors.image_url_kn}
            helperText={errors.image_url_kn?.message || "Optional"}
          />
        </Grid>
      </Grid>
    </Paper>

    <Controller
      name="is_active"
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox checked={field.value ?? true} onChange={(_, checked) => field.onChange(checked)} />}
          label="Active"
        />
      )}
    />
  </Stack>
);
