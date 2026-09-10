import type {
  AppCarouselInput,
  CarouselLocaleContent,
  CarouselTranslations,
} from "../../types/carousel";
import { sanitizeImageUrl, validateImageUrl } from "../../utils/imageUrl.ts";

const optionalText = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const optionalDate = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const kannadaScriptPattern = /[\u0C80-\u0CFF]/;
export const englishLettersPattern = /[A-Za-z]/;

export const validateEnglishCarouselText = (
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

export const validateKannadaCarouselText = (
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

export const normalizeCarousel = (
  values: AppCarouselInput,
): {
  carousel_code: string;
  action_type: AppCarouselInput["action_type"];
  action_value: string | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  default_locale: string;
  translations: CarouselTranslations;
} => {
  if (values.title_en?.trim()) {
    const err = validateEnglishCarouselText(values.title_en, "English Title");
    if (err !== true) throw new Error(err);
  }
  if (values.subtitle_en?.trim()) {
    const err = validateEnglishCarouselText(values.subtitle_en, "English Subtitle");
    if (err !== true) throw new Error(err);
  }
  if (values.alt_text_en?.trim()) {
    const err = validateEnglishCarouselText(values.alt_text_en, "English Alt Text");
    if (err !== true) throw new Error(err);
  }
  if (values.description_en?.trim()) {
    const err = validateEnglishCarouselText(values.description_en, "English Description");
    if (err !== true) throw new Error(err);
  }

  if (values.title_kn?.trim()) {
    const err = validateKannadaCarouselText(values.title_kn, "Kannada Title");
    if (err !== true) throw new Error(err);
  }
  if (values.subtitle_kn?.trim()) {
    const err = validateKannadaCarouselText(values.subtitle_kn, "Kannada Subtitle");
    if (err !== true) throw new Error(err);
  }
  if (values.alt_text_kn?.trim()) {
    const err = validateKannadaCarouselText(values.alt_text_kn, "Kannada Alt Text");
    if (err !== true) throw new Error(err);
  }
  if (values.description_kn?.trim()) {
    const err = validateKannadaCarouselText(values.description_kn, "Kannada Description");
    if (err !== true) throw new Error(err);
  }

  const defaultLocale = values.default_locale?.trim() || "en";
  const translations: CarouselTranslations = {
    ...(values.translations || {}),
  };

  // Build English (en) translation
  const enImageUrl = sanitizeImageUrl(values.image_url_en);
  if (enImageUrl) {
    const err = validateImageUrl(enImageUrl, { required: false, requireHttps: true, fieldLabel: "English banner image URL" });
    if (err !== true) throw new Error(err);
    translations.en = {
      image_url: enImageUrl,
      title: optionalText(values.title_en),
      subtitle: optionalText(values.subtitle_en),
      alt_text: optionalText(values.alt_text_en),
      description: optionalText(values.description_en),
    };
  }

  // Build Kannada (kn) translation
  const knImageUrl = sanitizeImageUrl(values.image_url_kn);
  if (knImageUrl) {
    const err = validateImageUrl(knImageUrl, { required: false, requireHttps: true, fieldLabel: "Kannada banner image URL" });
    if (err !== true) throw new Error(err);
    translations.kn = {
      image_url: knImageUrl,
      title: optionalText(values.title_kn),
      subtitle: optionalText(values.subtitle_kn),
      alt_text: optionalText(values.alt_text_kn),
      description: optionalText(values.description_kn),
    };
  } else if (values.title_kn || values.subtitle_kn) {
    // If Kannada has text but no specific image, fallback to English image if available
    if (enImageUrl) {
      translations.kn = {
        image_url: enImageUrl,
        title: optionalText(values.title_kn),
        subtitle: optionalText(values.subtitle_kn),
        alt_text: optionalText(values.alt_text_kn),
        description: optionalText(values.description_kn),
      };
    }
  }

  // Ensure default_locale exists in translations object
  if (!translations[defaultLocale]) {
    // If default is 'en' and we have enImageUrl
    if (defaultLocale === "en" && enImageUrl) {
      translations.en = {
        image_url: enImageUrl,
        title: optionalText(values.title_en),
        subtitle: optionalText(values.subtitle_en),
        alt_text: optionalText(values.alt_text_en),
        description: optionalText(values.description_en),
      };
    }
  }

  // Clean empty translation entries
  Object.keys(translations).forEach((key) => {
    const entry = translations[key];
    if (!entry || !entry.image_url) {
      delete translations[key];
    }
  });

  const normalizedActionType = values.action_type || "NONE";
  const normalizedActionValue =
    normalizedActionType === "NONE" ? null : optionalText(values.action_value);

  return {
    carousel_code: values.carousel_code.trim().toUpperCase(),
    action_type: normalizedActionType,
    action_value: normalizedActionValue,
    start_at: optionalDate(values.start_at),
    end_at: optionalDate(values.end_at),
    is_active: values.is_active ?? true,
    default_locale: defaultLocale,
    translations,
  };
};

export const getCarouselScheduleStatus = (
  carousel: { is_active: boolean; start_at: string | null; end_at: string | null },
): {
  status: "LIVE" | "UPCOMING" | "EXPIRED" | "ALWAYS_ACTIVE" | "INACTIVE";
  label: string;
  color: "success" | "info" | "error" | "default" | "warning";
} => {
  if (!carousel.is_active) {
    return { status: "INACTIVE", label: "Inactive", color: "default" };
  }

  const now = Date.now();
  const start = carousel.start_at ? new Date(carousel.start_at).getTime() : null;
  const end = carousel.end_at ? new Date(carousel.end_at).getTime() : null;

  if (end && end < now) {
    return { status: "EXPIRED", label: "Expired", color: "error" };
  }

  if (start && start > now) {
    return { status: "UPCOMING", label: "Upcoming", color: "info" };
  }

  if (start && start <= now && (!end || end >= now)) {
    return { status: "LIVE", label: "Live Now", color: "success" };
  }

  if (!start && !end) {
    return { status: "ALWAYS_ACTIVE", label: "Always Active", color: "success" };
  }

  return { status: "LIVE", label: "Live", color: "success" };
};
