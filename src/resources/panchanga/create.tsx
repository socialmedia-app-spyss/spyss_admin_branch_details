import type { BaseRecord, HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import type { DailyPanchangaInput } from "../../types/panchanga";
import { PanchangaForm } from "./PanchangaForm";
import { getKannadaDisplayDate } from "./displayDate";

const optional = (value?: string | null) => value?.trim() || null;
export const normalizePanchanga = (values: DailyPanchangaInput): DailyPanchangaInput => ({
  ...values,
  language: "kn",
  kali_yuga_year: values.kali_yuga_year ?? 28,
  vasara: optional(values.vasara),
  display_date: getKannadaDisplayDate(values.panchanga_date) || optional(values.display_date),
  special_note: optional(values.special_note),
  special_note2: optional(values.special_note2),
  special_note3: optional(values.special_note3),
});

export const PanchangaCreate = () => {
  const form = useForm<BaseRecord, HttpError, DailyPanchangaInput>({
    defaultValues: { language: "kn", panchanga_date: "", kali_yuga_year: 28, samvatsara: "", ayana: "", rutu: "", masa: "", paksha: "", tithi: "", vasara: "", weekday: "", nakshatra: "", yoga: "", karana: "", approve_status: false },
  });
  return <Create title="Create Daily Panchanga" saveButtonProps={{ ...form.saveButtonProps, onClick: form.handleSubmit((values) => form.refineCore.onFinish(normalizePanchanga(values))) }}>
    <PanchangaForm register={form.register} control={form.control} errors={form.formState.errors} setValue={form.setValue} />
  </Create>;
};
