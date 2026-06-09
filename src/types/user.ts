export interface UserProfile {
  id: string; // uuid
  email: string;
  full_name?: string; // null in schema
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED"; // Based on schema, 'SUSPENDED' is not present
  created_at: string;
  updated_at: string;
  approved_by?: string; // uuid, null in schema
  approved_at?: string; // null in schema
}
