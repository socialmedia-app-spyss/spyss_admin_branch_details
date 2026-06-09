export interface Branch {
  id: number;
  country_code_or_name: string;
  admin_level_1: string;
  city: string;
  admin_level_3: string;
  latitude: number;
  longitude: number;
  branch_name: string;
  address: string;
  mukhyashikshak_name: string;
  class_timings: string;
  contact_no: string;
  category: string;
  batch: "MORNING" | "AFTERNOON" | "EVENING"; // Based on CHECK constraint
  is_active: boolean;
  created_at: string; // Assuming ISO string format from Supabase
  updated_at: string; // Assuming ISO string format from Supabase
}
