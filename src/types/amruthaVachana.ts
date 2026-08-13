export interface AmruthaVachanaAuthor {
  id: string;
  author_code: string;
  is_active: boolean;
  display_order: number;
}

export interface AmruthaVachanaAuthorTranslation {
  id: string;
  author_id: string;
  language: string;
  author_name: string;
}

export interface DailyAmruthaVachana {
  id: string;
  language: string;
  vachana_date: string;
  date_index: number;
  author_id: string;
  vachana_text: string;
  title?: string | null;
  attribution_override?: string | null;
  sequence_number?: number | null;
  template_code: string;
  canvas_width: number;
  canvas_height: number;
  text_alignment: "left" | "center" | "right";
  font_family?: string | null;
  font_size?: number | null;
  minimum_font_size: number;
  line_spacing?: number | null;
  maximum_lines: number;
  text_color: string;
  attribution_color: string;
  approve_status: boolean;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  image_storage_path?: string | null;
  image_generated_at?: string | null;
  image_generation_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  image_generation_error?: string | null;
  image_source_hash?: string | null;
  image_version: number;
  generation_attempts: number;
  last_generation_attempt_at?: string | null;
  image_template_id?: number | null;
  image_template_version?: number | null;
}

export type DailyAmruthaVachanaInput = Pick<
  DailyAmruthaVachana,
  | "language"
  | "vachana_date"
  | "author_id"
  | "vachana_text"
  | "title"
  | "attribution_override"
  | "sequence_number"
  | "template_code"
  | "canvas_width"
  | "canvas_height"
  | "text_alignment"
  | "font_family"
  | "font_size"
  | "minimum_font_size"
  | "line_spacing"
  | "maximum_lines"
  | "text_color"
  | "attribution_color"
  | "approve_status"
  | "is_active"
>;
