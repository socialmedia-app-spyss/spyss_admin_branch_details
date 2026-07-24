export type UserRole =
  | "SUPER_ADMIN"
  | "STATE_ADMIN"
  | "DISTRICT_ADMIN"
  | "VALAYA_ADMIN"
  | "BRANCH_ADMIN"
  | "PANCHANGA_ADMIN"
  | "USER";

export type UserStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export const userStatusOptions: UserStatus[] = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
export const userRoleOptions: UserRole[] = [
  "SUPER_ADMIN",
  "STATE_ADMIN",
  "DISTRICT_ADMIN",
  "VALAYA_ADMIN",
  "BRANCH_ADMIN",
  "PANCHANGA_ADMIN",
  "USER",
];

export interface UserProfile {
  id: string; // uuid
  email: string;
  full_name: string;
  phone_number?: string | null;
  role: UserRole;
  status: UserStatus;
  state_id?: string | null;
  district_id?: string | null;
  valaya_id?: string | null;
  branch_id?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  valaya_code?: string | null;
  valaya_name?: string | null;
  accessible_valaya_rows?: Array<{
    id: string;
    valaya_name_en: string;
    valaya_name_kn: string;
    valaya_code: string;
    district_id: string;
  }>;
  accessible_valaya_ids?: string[];
  accessible_district_ids?: string[];
}
