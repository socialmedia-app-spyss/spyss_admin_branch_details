export type EventCategory =
  | "GENERAL"
  | "CAMP"
  | "WORKSHOP"
  | "FESTIVAL"
  | "COMPETITION"
  | "CELEBRATION"
  | "SPECIAL";

export const EVENT_CATEGORIES: { value: EventCategory; label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }[] = [
  { value: "GENERAL", label: "General", color: "default" },
  { value: "CAMP", label: "Camp / Shibira", color: "primary" },
  { value: "WORKSHOP", label: "Workshop", color: "info" },
  { value: "FESTIVAL", label: "Festival", color: "warning" },
  { value: "COMPETITION", label: "Competition", color: "secondary" },
  { value: "CELEBRATION", label: "Celebration", color: "success" },
  { value: "SPECIAL", label: "Special Event", color: "error" },
];

export type LocalizedField = Record<string, string | undefined> & {
  en?: string;
  kn?: string;
};

export interface AppEvent {
  id: number;
  event_code: string;
  version: number;
  category: EventCategory;
  title: LocalizedField;
  short_description: LocalizedField;
  full_description: LocalizedField;
  location_name: LocalizedField;
  address: LocalizedField;
  map_url: string | null;
  registration_link: string | null;
  contact_person: LocalizedField;
  contact_phone: string | null;
  image_url: LocalizedField;
  start_datetime: string;
  end_datetime: string;
  event_timezone: string;
  visible_from: string;
  send_announcement_push: boolean;
  announcement_sent_at: string | null;
  reminder_sent_at: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Backward-compatibility alias
export type Event = AppEvent;

export interface AppEventInput {
  event_code: string;
  version: number;
  category: EventCategory;
  title_en: string;
  title_kn: string;
  short_description_en: string;
  short_description_kn: string;
  full_description_en: string;
  full_description_kn: string;
  location_name_en: string;
  location_name_kn: string;
  address_en: string;
  address_kn: string;
  map_url?: string | null;
  registration_link?: string | null;
  contact_person_en: string;
  contact_person_kn: string;
  contact_phone?: string | null;
  image_url_en?: string | null;
  image_url_kn?: string | null;
  start_datetime: string;
  end_datetime: string;
  event_timezone: string;
  visible_from: string;
  send_announcement_push: boolean;
  is_active: boolean;
  announcement_sent_at?: string | null;
  reminder_sent_at?: string | null;
}

// Backward-compatibility alias
export type EventInput = AppEventInput;
