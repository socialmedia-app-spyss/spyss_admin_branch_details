import type { AppPanchangaInput } from "../../types/panchanga";
import { getKannadaDisplayDate } from "./displayDate.ts";

const optional = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export const normalizePanchanga = (
  values: AppPanchangaInput,
): AppPanchangaInput => {
  const lang = (values.language || "kn").trim().toLowerCase() || "kn";

  return {
    ...values,
    language: lang,
    panchanga_date: values.panchanga_date.trim(),
    kali_yuga_year: values.kali_yuga_year ?? 28,
    samvatsara: values.samvatsara.trim(),
    ayana: values.ayana.trim(),
    rutu: values.rutu.trim(),
    masa: values.masa.trim(),
    paksha: values.paksha.trim(),
    tithi: values.tithi.trim(),
    vasara: optional(values.vasara),
    weekday: values.weekday.trim(),
    nakshatra: values.nakshatra.trim(),
    yoga: values.yoga.trim(),
    karana: values.karana.trim(),
    display_date:
      getKannadaDisplayDate(values.panchanga_date) || optional(values.display_date),
    special_note: optional(values.special_note),
    special_note2: optional(values.special_note2),
    special_note3: optional(values.special_note3),
    approve_status: Boolean(values.approve_status),
    is_active: values.is_active ?? true,
    image_url: optional(values.image_url),
    image_storage_path: optional(values.image_storage_path),
    image_generation_status: values.image_generation_status || "PENDING",
    image_version: values.image_version || 1,
    image_template_id: values.image_template_id || null,
  };
};
