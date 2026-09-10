export type CarouselActionType =
  | "NONE"
  | "URL"
  | "YOUTUBE"
  | "EVENT"
  | "BRANCH"
  | "ARTICLE"
  | "FESTIVAL";

export interface CarouselLocaleContent {
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  alt_text?: string | null;
  description?: string | null;
}

export type CarouselTranslations = Record<string, CarouselLocaleContent>;

export interface AppCarousel {
  id: string;
  carousel_code: string;
  action_type: CarouselActionType;
  action_value: string | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  translations: CarouselTranslations;
  default_locale: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AppCarouselInput {
  carousel_code: string;
  action_type: CarouselActionType;
  action_value?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  default_locale: string;
  // Form fields for English (en) locale
  image_url_en: string;
  title_en?: string | null;
  subtitle_en?: string | null;
  alt_text_en?: string | null;
  description_en?: string | null;
  // Form fields for Kannada (kn) locale
  image_url_kn?: string | null;
  title_kn?: string | null;
  subtitle_kn?: string | null;
  alt_text_kn?: string | null;
  description_kn?: string | null;
  // Additional translations
  translations?: CarouselTranslations;
}

export type CarouselScheduleStatus =
  | "LIVE"
  | "UPCOMING"
  | "EXPIRED"
  | "ALWAYS_ACTIVE"
  | "INACTIVE";
