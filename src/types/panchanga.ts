export interface DailyPanchanga {
  id: string;
  language: string;
  panchanga_date: string;
  date_index: number;
  krishna_shaka_year?: number | null;
  shalivahana_shaka_year?: number | null;
  kali_yuga_year?: number | null;
  samvatsara: string;
  ayana: string;
  rutu: string;
  masa: string;
  paksha: string;
  tithi: string;
  vasara?: string | null;
  weekday: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  display_date?: string | null;
  special_note?: string | null;
  special_note2?: string | null;
  special_note3?: string | null;
  approve_status?: boolean | null;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  image_storage_path?: string | null;
  image_generated_at?: string | null;
  image_generation_error?: string | null;
  image_source_hash?: string | null;
  image_template_id?: number | null;
  image_template_version?: number | null;
}

export type DailyPanchangaInput = Omit<
  DailyPanchanga,
  "id" | "date_index" | "created_at" | "updated_at" | "image_generated_at" |
  "image_generation_error" | "image_source_hash" | "image_template_version"
>;
