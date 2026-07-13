export interface Notification {
  id: number;
  notification_code?: string | null;
  version: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  type: "GENERAL" | "EVENT" | "BRANCH" | "ANNOUNCEMENT" | "EMERGENCY";
  title_en: string;
  body_en: string;
  title_kn?: string | null;
  body_kn?: string | null;
  created_at: string;
  date_time?: string | null;
  expiry_date?: string | null;
  is_active: boolean;
  updated_at: string;
}

export type NotificationInput = Pick<
  Notification,
  "priority" | "type" | "title_en" | "body_en" | "title_kn" | "body_kn" | "date_time" | "expiry_date" | "is_active"
>;
