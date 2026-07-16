export interface Event {
  id: number;
  event_name_en: string;
  event_name_kn?: string | null;
  short_description_en: string;
  short_description_kn?: string | null;
  full_description_en: string;
  full_description_kn?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  location_en: string;
  location_kn?: string | null;
  registration_link?: string | null;
  image_url_en?: string | null;
  image_url_kn?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EventInput = Omit<
  Event,
  | "id"
  | "created_at"
  | "updated_at"
  | "event_name_kn"
  | "short_description_kn"
  | "full_description_kn"
  | "location_kn"
> & {
  event_name_kn: string;
  short_description_kn: string;
  full_description_kn: string;
  location_kn: string;
};
