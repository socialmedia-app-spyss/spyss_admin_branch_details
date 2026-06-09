export interface Event {
  id: number;
  event_name: string;
  short_description: string;
  full_description: string;
  start_datetime?: string; // ISO string
  end_datetime?: string; // ISO string
  location: string;
  registration_link?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}
