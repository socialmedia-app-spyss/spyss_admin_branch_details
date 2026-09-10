import type { AppEvent, AppEventInput, EventCategory, LocalizedField } from "../../types/event";

const VALID_CATEGORIES: EventCategory[] = [
  "GENERAL",
  "CAMP",
  "WORKSHOP",
  "FESTIVAL",
  "COMPETITION",
  "CELEBRATION",
  "SPECIAL",
];

export const generateEventCode = (titleEn?: string | null): string => {
  const currentYear = new Date().getFullYear();
  if (titleEn && titleEn.trim()) {
    const slug = titleEn
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `EVT-${currentYear}-${slug}-${rand}`;
  }
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `EVT-${currentYear}-${rand}`;
};

export const buildLocalizedObject = (
  en?: string | null,
  kn?: string | null
): LocalizedField => {
  const obj: LocalizedField = {};
  const trimmedEn = en?.trim();
  const trimmedKn = kn?.trim();

  if (trimmedEn) {
    obj.en = trimmedEn;
  }
  if (trimmedKn) {
    obj.kn = trimmedKn;
  }
  return obj;
};

const optionalText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export const normalizeEvent = (values: AppEventInput): Omit<AppEvent, "id" | "created_at" | "updated_at"> => {
  const title = buildLocalizedObject(values.title_en, values.title_kn);
  if (!title.en && !title.kn) {
    throw new Error("Event title in either English or Kannada is required.");
  }

  const category: EventCategory = VALID_CATEGORIES.includes(values.category)
    ? values.category
    : "GENERAL";

  const eventCode = (values.event_code || "").trim().toUpperCase() || generateEventCode(values.title_en);

  const startIso = values.start_datetime ? new Date(values.start_datetime).toISOString() : new Date().toISOString();
  const endIso = values.end_datetime ? new Date(values.end_datetime).toISOString() : startIso;

  if (new Date(endIso).getTime() < new Date(startIso).getTime()) {
    throw new Error("Event end date & time cannot be before start date & time.");
  }

  const visibleFromIso = values.visible_from ? new Date(values.visible_from).toISOString() : new Date().toISOString();

  let version = typeof values.version === "number" ? Math.floor(values.version) : parseInt(String(values.version || "1"), 10);
  if (isNaN(version) || version < 1) {
    version = 1;
  }

  return {
    event_code: eventCode,
    version,
    category,
    title,
    short_description: buildLocalizedObject(values.short_description_en, values.short_description_kn),
    full_description: buildLocalizedObject(values.full_description_en, values.full_description_kn),
    location_name: buildLocalizedObject(values.location_name_en, values.location_name_kn),
    address: buildLocalizedObject(values.address_en, values.address_kn),
    map_url: optionalText(values.map_url),
    registration_link: optionalText(values.registration_link),
    contact_person: buildLocalizedObject(values.contact_person_en, values.contact_person_kn),
    contact_phone: optionalText(values.contact_phone),
    image_url: buildLocalizedObject(values.image_url_en, values.image_url_kn),
    start_datetime: startIso,
    end_datetime: endIso,
    event_timezone: (values.event_timezone || "").trim() || "Asia/Kolkata",
    visible_from: visibleFromIso,
    send_announcement_push: Boolean(values.send_announcement_push),
    announcement_sent_at: values.announcement_sent_at || null,
    reminder_sent_at: values.reminder_sent_at || null,
    is_active: Boolean(values.is_active),
  };
};
