export interface Notification {
  id: number;
  notification_code?: string;
  version: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  type: "GENERAL" | "EVENT" | "BRANCH" | "ANNOUNCEMENT" | "EMERGENCY";
  title: string;
  body: string;
  created_at: string; // ISO string
  date_time?: string; // ISO string
  expiry_date?: string; // ISO string
  is_active: boolean;
  updated_at: string; // ISO string
}
