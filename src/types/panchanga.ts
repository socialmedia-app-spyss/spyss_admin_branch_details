export type ImageGenerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface AppPanchanga {
  id: string;
  language: string;
  panchanga_date: string;
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
  approve_status: boolean;
  is_active: boolean;
  image_url?: string | null;
  image_storage_path?: string | null;
  image_generated_at?: string | null;
  image_generation_status: ImageGenerationStatus;
  image_generation_error?: string | null;
  image_source_hash?: string | null;
  image_version: number;
  generation_attempts: number;
  last_generation_attempt_at?: string | null;
  image_template_id?: number | null;
  image_template_version?: number | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Backward-compatibility alias
export type DailyPanchanga = AppPanchanga;

export type AppPanchangaInput = Omit<
  AppPanchanga,
  | "id"
  | "created_at"
  | "updated_at"
  | "image_generated_at"
  | "image_generation_error"
  | "image_source_hash"
  | "image_template_version"
  | "generation_attempts"
  | "last_generation_attempt_at"
>;

// Backward-compatibility alias
export type DailyPanchangaInput = AppPanchangaInput;
