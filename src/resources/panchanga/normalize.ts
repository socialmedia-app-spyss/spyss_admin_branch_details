import type { DailyPanchangaInput } from "../../types/panchanga";
import { getKannadaDisplayDate } from "./displayDate";

const optional = (value?: string | null) => value?.trim() || null;

export const normalizePanchanga = (
  values: DailyPanchangaInput,
): DailyPanchangaInput => ({
  ...values,
  language: "kn",
  kali_yuga_year: values.kali_yuga_year ?? 28,
  vasara: optional(values.vasara),
  display_date:
    getKannadaDisplayDate(values.panchanga_date) || optional(values.display_date),
  special_note: optional(values.special_note),
  special_note2: optional(values.special_note2),
  special_note3: optional(values.special_note3),
});
