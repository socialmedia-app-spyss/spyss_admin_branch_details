import type { AppEvent, AppEventInput, EventCategory, LocalizedField } from "../../types/event";
import { sanitizeImageUrl, validateImageUrl } from "../../utils/imageUrl.ts";

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

export const kannadaScriptPattern = /[\u0C80-\u0CFF]/;
export const englishLettersPattern = /[A-Za-z]/;

export const validateEnglishEventText = (
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

export const validateKannadaEventText = (
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

export const normalizeEvent = (values: AppEventInput): Omit<AppEvent, "id" | "created_at" | "updated_at"> => {
  const title = buildLocalizedObject(values.title_en, values.title_kn);
  if (!title.en && !title.kn) {
    throw new Error("Event title in either English or Kannada is required.");
  }

  if (values.title_en?.trim()) {
    const err = validateEnglishEventText(values.title_en, "English Title");
    if (err !== true) throw new Error(err);
  }
  if (values.short_description_en?.trim()) {
    const err = validateEnglishEventText(values.short_description_en, "English Short Description");
    if (err !== true) throw new Error(err);
  }
  if (values.full_description_en?.trim()) {
    const err = validateEnglishEventText(values.full_description_en, "English Full Description");
    if (err !== true) throw new Error(err);
  }
  if (values.location_name_en?.trim()) {
    const err = validateEnglishEventText(values.location_name_en, "English Location Name");
    if (err !== true) throw new Error(err);
  }
  if (values.contact_person_en?.trim()) {
    const err = validateEnglishEventText(values.contact_person_en, "English Contact Person");
    if (err !== true) throw new Error(err);
  }
  if (values.address_en?.trim()) {
    const err = validateEnglishEventText(values.address_en, "English Address");
    if (err !== true) throw new Error(err);
  }

  if (values.title_kn?.trim()) {
    const err = validateKannadaEventText(values.title_kn, "Kannada Title");
    if (err !== true) throw new Error(err);
  }
  if (values.short_description_kn?.trim()) {
    const err = validateKannadaEventText(values.short_description_kn, "Kannada Short Description");
    if (err !== true) throw new Error(err);
  }
  if (values.full_description_kn?.trim()) {
    const err = validateKannadaEventText(values.full_description_kn, "Kannada Full Description");
    if (err !== true) throw new Error(err);
  }
  if (values.location_name_kn?.trim()) {
    const err = validateKannadaEventText(values.location_name_kn, "Kannada Location Name");
    if (err !== true) throw new Error(err);
  }
  if (values.contact_person_kn?.trim()) {
    const err = validateKannadaEventText(values.contact_person_kn, "Kannada Contact Person");
    if (err !== true) throw new Error(err);
  }
  if (values.address_kn?.trim()) {
    const err = validateKannadaEventText(values.address_kn, "Kannada Address");
    if (err !== true) throw new Error(err);
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

  const enImageUrl = sanitizeImageUrl(values.image_url_en);
  if (enImageUrl) {
    const err = validateImageUrl(enImageUrl, { required: false, fieldLabel: "English image URL" });
    if (err !== true) throw new Error(err);
  }

  const knImageUrl = sanitizeImageUrl(values.image_url_kn);
  if (knImageUrl) {
    const err = validateImageUrl(knImageUrl, { required: false, fieldLabel: "Kannada image URL" });
    if (err !== true) throw new Error(err);
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
    image_url: buildLocalizedObject(enImageUrl, knImageUrl),
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
