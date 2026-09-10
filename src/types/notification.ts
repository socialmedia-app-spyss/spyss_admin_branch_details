export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type NotificationType =
  | "GENERAL"
  | "EVENT"
  | "BRANCH"
  | "ANNOUNCEMENT"
  | "EMERGENCY"
  | "FESTIVAL"
  | "PANCHANGA"
  | "AMRUTHA_VACHANA"
  | "ACTIVITY";

export type NotificationTargetType =
  | "ALL"
  | "LANGUAGE"
  | "TOPIC"
  | "VALAYA"
  | "BRANCH"
  | "ROLE";

export type NotificationActionType =
  | "NAVIGATE_EVENT"
  | "NAVIGATE_BRANCH"
  | "OPEN_URL"
  | "NONE";

export type NotificationSendStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

export const NOTIFICATION_PRIORITIES: {
  value: NotificationPriority;
  label: string;
  color: "default" | "info" | "warning" | "error";
}[] = [
  { value: "LOW", label: "Low", color: "info" },
  { value: "NORMAL", label: "Normal", color: "default" },
  { value: "HIGH", label: "High", color: "warning" },
  { value: "URGENT", label: "Urgent", color: "error" },
];

export const NOTIFICATION_TYPES: {
  value: NotificationType;
  label: string;
}[] = [
  { value: "GENERAL", label: "General Notice" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "EVENT", label: "Event Alert" },
  { value: "BRANCH", label: "Branch Update" },
  { value: "FESTIVAL", label: "Festival Greeting" },
  { value: "PANCHANGA", label: "Daily Panchanga" },
  { value: "AMRUTHA_VACHANA", label: "Amrutha Vachana" },
  { value: "ACTIVITY", label: "Branch Activity" },
  { value: "EMERGENCY", label: "Emergency Alert" },
];

export const NOTIFICATION_TARGET_TYPES: {
  value: NotificationTargetType;
  label: string;
  description: string;
}[] = [
  { value: "ALL", label: "All Users", description: "Broadcast to all mobile app installations" },
  { value: "VALAYA", label: "By Valaya (Region)", description: "Target users belonging to a specific Valaya" },
  { value: "BRANCH", label: "By Branch (Shakhe)", description: "Target users belonging to a specific Branch" },
  { value: "ROLE", label: "By User Role", description: "Target specific admin/teacher roles" },
  { value: "TOPIC", label: "By Topic Subscription", description: "Target users subscribed to a custom topic" },
  { value: "LANGUAGE", label: "By Preferred Language", description: "Target users by language preference (en/kn)" },
];

export const NOTIFICATION_ACTION_TYPES: {
  value: NotificationActionType;
  label: string;
}[] = [
  { value: "NONE", label: "None (Display Only)" },
  { value: "OPEN_URL", label: "Open External Web URL" },
  { value: "NAVIGATE_EVENT", label: "Navigate to Event Screen" },
  { value: "NAVIGATE_BRANCH", label: "Navigate to Branch Screen" },
];

export interface AppNotification {
  id: number;
  notification_code: string;
  version: number;
  priority: NotificationPriority;
  type: NotificationType;
  target_type: NotificationTargetType;
  target_payload: Record<string, any>;
  title: {
    en?: string;
    kn?: string;
    [key: string]: string | undefined;
  };
  body: {
    en?: string;
    kn?: string;
    [key: string]: string | undefined;
  };
  image_url: string | null;
  action_type: NotificationActionType | null;
  action_payload: Record<string, any> | null;
  date_time: string;
  expiry_date: string | null;
  send_status: NotificationSendStatus;
  send_attempts: number;
  processing_started_at: string | null;
  sent_at: string | null;
  last_send_error: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Backward-compatibility alias
export type Notification = AppNotification;

export interface AppNotificationInput {
  notification_code: string;
  version: number;
  priority: NotificationPriority;
  type: NotificationType;
  target_type: NotificationTargetType;
  target_valaya_id?: string | null;
  target_branch_id?: string | null;
  target_role?: string | null;
  target_topic?: string | null;
  target_language?: string | null;
  title_en: string;
  title_kn: string;
  body_en: string;
  body_kn: string;
  image_url?: string | null;
  action_type?: NotificationActionType | null;
  action_url?: string | null;
  action_event_id?: string | null;
  action_branch_id?: string | null;
  date_time: string;
  expiry_date?: string | null;
  send_status?: NotificationSendStatus;
  is_active: boolean;
}

// Backward-compatibility alias
export type NotificationInput = AppNotificationInput;
