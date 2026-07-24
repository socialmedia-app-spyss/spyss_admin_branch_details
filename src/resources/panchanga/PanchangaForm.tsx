import { Checkbox, FormControlLabel, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { DailyPanchangaInput } from "../../types/panchanga";
import { panchangaOptions } from "./options";

type Props = {
  register: UseFormRegister<DailyPanchangaInput>;
  control: Control<DailyPanchangaInput>;
  errors: FieldErrors<DailyPanchangaInput>;
};

const labels: Record<keyof typeof panchangaOptions, string> = {
  samvatsara: "ಸಂವತ್ಸರ", ayana: "ಆಯನ", rutu: "ಋತು", masa: "ಮಾಸ",
  paksha: "ಪಕ್ಷ", tithi: "ತಿಥಿ", vasara: "ವಾಸರ", weekday: "ವಾರ",
  nakshatra: "ನಕ್ಷತ್ರ", yoga: "ಯೋಗ", karana: "ಕರಣ",
};

export const PanchangaForm = ({ register, control, errors }: Props) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Date and calendar years</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...register("panchanga_date", { required: "Date is required." })} type="date" label="Panchanga Date *" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.panchanga_date} helperText={errors.panchanga_date?.message} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...register("language")} label="Language" value="kn" fullWidth disabled />
          </Grid>
          {(["krishna_shaka_year", "shalivahana_shaka_year", "kali_yuga_year"] as const).map((name) => (
            <Grid item xs={12} sm={4} key={name}>
              <TextField
                {...register(name, { setValueAs: (value) => value === "" ? null : Number(value) })}
                type="number"
                label={name.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>

    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>ಪಂಚಾಂಗ ವಿವರಗಳು</Typography>
        <Grid container spacing={2}>
          {(Object.keys(panchangaOptions) as Array<keyof typeof panchangaOptions>).map((name) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <Controller
                name={name}
                control={control}
                rules={{ required: name === "vasara" ? false : `${labels[name]} is required.` }}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ""} select fullWidth label={`${labels[name]}${name === "vasara" ? "" : " *"}`} error={!!errors[name]} helperText={errors[name]?.message}>
                    {name === "vasara" && <MenuItem value=""><em>None</em></MenuItem>}
                    {panchangaOptions[name].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>

    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Display and notes</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField {...register("display_date")} label="Display Date" fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          {(["special_note", "special_note2", "special_note3"] as const).map((name, index) => (
            <Grid item xs={12} key={name}>
              <TextField {...register(name)} label={`Special Note ${index + 1}`} multiline minRows={2} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Controller name="approve_status" control={control} render={({ field }) => (
              <FormControlLabel control={<Checkbox checked={field.value ?? false} onChange={(_, checked) => field.onChange(checked)} />} label="Approved" />
            )} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  </Grid>
);
