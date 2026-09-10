import type {
  AppNotification,
  AppNotificationInput,
  NotificationActionType,
  NotificationPriority,
  NotificationTargetType,
  NotificationType,
} from "../../types/notification";

export const kannadaScriptPattern = /[\u0C80-\u0CFF]/;
export const englishLettersPattern = /[A-Za-z]/;

export const validateEnglishNotificationText = (
  value?: string | null,
  fieldLabel: string = "English content"
): true | string => {
  const text = String(value ?? "").trim();
  if (!text) {
    return true;
  }
  if (kannadaScriptPattern.test(text)) {
    return `${fieldLabel} cannot contain Kannada characters. Please enter English text only.`;
  }
  if (!englishLettersPattern.test(text)) {
    return `${fieldLabel} must contain English letters.`;
  }
  return true;
};

export const validateKannadaNotificationText = (
  value?: string | null,
  fieldLabel: string = "Kannada content"
): true | string => {
  const text = String(value ?? "").trim();
  if (!text) {
    return true;
  }
  if (englishLettersPattern.test(text)) {
    return `${fieldLabel} cannot contain English letters (English numbers 0-9 are allowed).`;
  }
  if (!kannadaScriptPattern.test(text)) {
    return `${fieldLabel} must contain Kannada characters.`;
  }
  return true;
};

export const generateNotificationCode = (titleEn?: string | null): string => {
  const currentYear = new Date().getFullYear();
  if (titleEn && titleEn.trim()) {
    const slug = titleEn
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20);
    const rand = Math.floor(1000 + Math.random() * 9000);
    if (slug) {
      return `NOTIF-${currentYear}-${slug}-${rand}`;
    }
  }
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `NOTIF-${currentYear}-${rand}`;
};

const optionalText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export const normalizeNotification = (
  input: AppNotificationInput
): Omit<AppNotification, "id" | "created_at" | "updated_at" | "send_attempts" | "processing_started_at" | "sent_at" | "last_send_error"> => {
  const trimmedTitleEn = input.title_en?.trim() || "";
  const trimmedBodyEn = input.body_en?.trim() || "";
  const trimmedTitleKn = input.title_kn?.trim() || "";
  const trimmedBodyKn = input.body_kn?.trim() || "";

  const hasCompleteEnglish = Boolean(trimmedTitleEn && trimmedBodyEn);
  const hasCompleteKannada = Boolean(trimmedTitleKn && trimmedBodyKn);

  if (!hasCompleteEnglish && !hasCompleteKannada) {
    throw new Error(
      "Notification requires complete content (Title & Body) in either English or Kannada."
    );
  }

  if (trimmedTitleEn) {
    const err = validateEnglishNotificationText(trimmedTitleEn, "English Title");
    if (err !== true) throw new Error(err);
  }
  if (trimmedBodyEn) {
    const err = validateEnglishNotificationText(trimmedBodyEn, "English Body");
    if (err !== true) throw new Error(err);
  }
  if (trimmedTitleKn) {
    const err = validateKannadaNotificationText(trimmedTitleKn, "Kannada Title");
    if (err !== true) throw new Error(err);
  }
  if (trimmedBodyKn) {
    const err = validateKannadaNotificationText(trimmedBodyKn, "Kannada Body");
    if (err !== true) throw new Error(err);
  }

  const title: Record<string, string> = {};
  if (trimmedTitleEn) title.en = trimmedTitleEn;
  if (trimmedTitleKn) title.kn = trimmedTitleKn;

  const body: Record<string, string> = {};
  if (trimmedBodyEn) body.en = trimmedBodyEn;
  if (trimmedBodyKn) body.kn = trimmedBodyKn;

  const notificationCode =
    (input.notification_code || "").trim().toUpperCase() ||
    generateNotificationCode(trimmedTitleEn || trimmedTitleKn);

  const dateTimeIso = input.date_time
    ? new Date(input.date_time).toISOString()
    : new Date().toISOString();

  let expiryDateIso: string | null = null;
  if (input.expiry_date) {
    expiryDateIso = new Date(input.expiry_date).toISOString();
    if (new Date(expiryDateIso).getTime() <= new Date(dateTimeIso).getTime()) {
      throw new Error("Expiry date must be later than the scheduled event/dispatch date & time.");
    }
  }

  // Construct target_payload based on target_type
  const targetType: NotificationTargetType = input.target_type || "ALL";
  const targetPayload: Record<string, any> = {};

  if (targetType === "VALAYA" && input.target_valaya_id) {
    targetPayload.valaya_id = input.target_valaya_id.trim();
  } else if (targetType === "BRANCH" && input.target_branch_id) {
    targetPayload.branch_id = input.target_branch_id.trim();
  } else if (targetType === "ROLE" && input.target_role) {
    targetPayload.role = input.target_role.trim();
  } else if (targetType === "TOPIC" && input.target_topic) {
    targetPayload.topic = input.target_topic.trim();
  } else if (targetType === "LANGUAGE" && input.target_language) {
    targetPayload.language = input.target_language.trim();
  }

  // Construct action_payload based on action_type
  const actionType: NotificationActionType | null =
    input.action_type && input.action_type !== "NONE" ? input.action_type : null;
  let actionPayload: Record<string, any> | null = null;

  if (actionType === "OPEN_URL" && input.action_url?.trim()) {
    actionPayload = { url: input.action_url.trim() };
  } else if (actionType === "NAVIGATE_EVENT" && input.action_event_id?.trim()) {
    actionPayload = { event_id: input.action_event_id.trim() };
  } else if (actionType === "NAVIGATE_BRANCH" && input.action_branch_id?.trim()) {
    actionPayload = { branch_id: input.action_branch_id.trim() };
  }

  let version =
    typeof input.version === "number"
      ? Math.floor(input.version)
      : parseInt(String(input.version || "1"), 10);
  if (isNaN(version) || version < 1) {
    version = 1;
  }

  return {
    notification_code: notificationCode,
    version,
    priority: (input.priority as NotificationPriority) || "NORMAL",
    type: (input.type as NotificationType) || "GENERAL",
    target_type: targetType,
    target_payload: targetPayload,
    title,
    body,
    image_url: optionalText(input.image_url),
    action_type: actionType,
    action_payload: actionPayload,
    date_time: dateTimeIso,
    expiry_date: expiryDateIso,
    send_status: input.send_status || "PENDING",
    is_active: Boolean(input.is_active),
  };
};
