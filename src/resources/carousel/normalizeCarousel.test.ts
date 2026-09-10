import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCarousel,
  getCarouselScheduleStatus,
  validateEnglishCarouselText,
  validateKannadaCarouselText,
} from "./normalizeCarousel.ts";
import type { AppCarouselInput } from "../../types/carousel.ts";

test("normalizeCarousel formats code, builds translations, and validates default locale", () => {
  const input: AppCarouselInput = {
    carousel_code: " yoga_utsav_2026 ",
    action_type: "URL",
    action_value: "  https://spyss.org/yoga-utsav  ",
    start_at: "2026-09-01T00:00:00.000Z",
    end_at: "2026-09-10T00:00:00.000Z",
    is_active: true,
    default_locale: "en",
    image_url_en: "https://example.com/banner-en.webp",
    title_en: " Yoga Utsav ",
    subtitle_en: " Join us ",
    alt_text_en: " Banner alt ",
    description_en: " Full description ",
    image_url_kn: "https://example.com/banner-kn.webp",
    title_kn: " ಯೋಗ ಉತ್ಸವ ",
  };

  const result = normalizeCarousel(input);

  assert.equal(result.carousel_code, "YOGA_UTSAV_2026");
  assert.equal(result.action_type, "URL");
  assert.equal(result.action_value, "https://spyss.org/yoga-utsav");
  assert.equal(result.is_active, true);
  assert.equal(result.default_locale, "en");

  // English translation object
  assert.equal(result.translations.en?.image_url, "https://example.com/banner-en.webp");
  assert.equal(result.translations.en?.title, "Yoga Utsav");
  assert.equal(result.translations.en?.subtitle, "Join us");
  assert.equal(result.translations.en?.alt_text, "Banner alt");
  assert.equal(result.translations.en?.description, "Full description");

  // Kannada translation object
  assert.equal(result.translations.kn?.image_url, "https://example.com/banner-kn.webp");
  assert.equal(result.translations.kn?.title, "ಯೋಗ ಉತ್ಸವ");
});

test("normalizeCarousel resets action_value to null when action_type is NONE", () => {
  const input: AppCarouselInput = {
    carousel_code: "BANNER_STATIC",
    action_type: "NONE",
    action_value: "https://unused-value.com",
    is_active: true,
    default_locale: "en",
    image_url_en: "https://example.com/static.webp",
  };

  const result = normalizeCarousel(input);
  assert.equal(result.action_type, "NONE");
  assert.equal(result.action_value, null);
});

test("normalizeCarousel falls back to English image for Kannada if only Kannada text is provided", () => {
  const input: AppCarouselInput = {
    carousel_code: "BANNER_DUAL_LANG",
    action_type: "NONE",
    is_active: true,
    default_locale: "en",
    image_url_en: "https://example.com/en-image.webp",
    title_en: "English Title",
    title_kn: "ಕನ್ನಡ ಶೀರ್ಷಿಕೆ",
  };

  const result = normalizeCarousel(input);
  assert.equal(result.translations.en?.image_url, "https://example.com/en-image.webp");
  assert.equal(result.translations.kn?.image_url, "https://example.com/en-image.webp");
  assert.equal(result.translations.kn?.title, "ಕನ್ನಡ ಶೀರ್ಷಿಕೆ");
});

test("getCarouselScheduleStatus determines status based on start_at and end_at", () => {
  // Inactive
  assert.equal(
    getCarouselScheduleStatus({ is_active: false, start_at: null, end_at: null }).status,
    "INACTIVE",
  );

  // Always active
  assert.equal(
    getCarouselScheduleStatus({ is_active: true, start_at: null, end_at: null }).status,
    "ALWAYS_ACTIVE",
  );

  // Expired
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  assert.equal(
    getCarouselScheduleStatus({ is_active: true, start_at: null, end_at: pastDate }).status,
    "EXPIRED",
  );

  // Upcoming
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  assert.equal(
    getCarouselScheduleStatus({ is_active: true, start_at: futureDate, end_at: null }).status,
    "UPCOMING",
  );

  // Live
  assert.equal(
    getCarouselScheduleStatus({ is_active: true, start_at: pastDate, end_at: futureDate }).status,
    "LIVE",
  );
});

test("validateEnglishCarouselText permits English with numbers and symbols, rejects Kannada", () => {
  // Empty is valid (optional field)
  assert.equal(validateEnglishCarouselText(""), true);
  assert.equal(validateEnglishCarouselText(null), true);
  assert.equal(validateEnglishCarouselText("   "), true);

  // Valid English with digits and symbols
  assert.equal(validateEnglishCarouselText("Yoga Camp 2026! @ Main Hall #5"), true);

  // Rejects Kannada characters
  const kannadaErr = validateEnglishCarouselText("Yoga Camp ಯೋಗ", "Title");
  assert.match(String(kannadaErr), /cannot contain Kannada characters/);

  // Rejects pure numbers / symbols without English letters
  const noLettersErr = validateEnglishCarouselText("12345!@#", "Title");
  assert.match(String(noLettersErr), /must contain English letters/);
});

test("validateKannadaCarouselText permits Kannada with English numbers, rejects English letters", () => {
  // Empty is valid (optional field)
  assert.equal(validateKannadaCarouselText(""), true);
  assert.equal(validateKannadaCarouselText(null), true);
  assert.equal(validateKannadaCarouselText("   "), true);

  // Valid Kannada with English numbers and symbols
  assert.equal(validateKannadaCarouselText("ಯೋಗ ಶಿಬಿರ 2026 - ಮುಖ್ಯ ಶಾಲೆ #1"), true);

  // Rejects English letters
  const englishErr = validateKannadaCarouselText("ಯೋಗ ಶಿಬಿರ Yoga", "Title");
  assert.match(String(englishErr), /cannot contain English letters/);

  // Rejects random English typing like fghjjj
  const randomErr = validateKannadaCarouselText("fghjjj", "Title");
  assert.match(String(randomErr), /cannot contain English letters/);

  // Rejects pure numbers without Kannada script
  const noKannadaErr = validateKannadaCarouselText("12345!@#", "Title");
  assert.match(String(noKannadaErr), /must contain Kannada characters/);
});

test("normalizeCarousel enforces script rules on English and Kannada fields", () => {
  const baseInput: AppCarouselInput = {
    carousel_code: "BANNER_TEST",
    action_type: "NONE",
    is_active: true,
    default_locale: "en",
    image_url_en: "https://example.com/banner.webp",
  };

  // Kannada characters in English field throws error
  assert.throws(
    () =>
      normalizeCarousel({
        ...baseInput,
        title_en: "Yoga ಯೋಗ",
      }),
    /English Title cannot contain Kannada characters/
  );

  // English letters in Kannada field throws error
  assert.throws(
    () =>
      normalizeCarousel({
        ...baseInput,
        title_kn: "fghjjj",
      }),
    /Kannada Title cannot contain English letters/
  );

  // Valid bilingual data with numbers and punctuation passes
  const valid = normalizeCarousel({
    ...baseInput,
    title_en: "Yoga Day 2026!",
    subtitle_en: "Annual Camp #1",
    title_kn: "ಯೋಗ ದಿನ 2026!",
    subtitle_kn: "ವಾರ್ಷಿಕ ಶಿಬಿರ #1",
  });

  assert.equal(valid.translations.en?.title, "Yoga Day 2026!");
  assert.equal(valid.translations.kn?.title, "ಯೋಗ ದಿನ 2026!");
});

test("normalizeCarousel auto-converts placehold.co URL and rejects SVG images", () => {
  const baseInput: AppCarouselInput = {
    carousel_code: "BANNER_PLACEHOLD",
    action_type: "NONE",
    is_active: true,
    default_locale: "en",
    image_url_en:
      "https://placehold.co/1200x630/FFF0F5/E91E63?text=Happy+Birthday%21%0AWishing+You+a+Wonderful+Day%21\\&font=roboto",
  };

  const result = normalizeCarousel(baseInput);
  assert.ok(result.translations.en?.image_url);
  assert.match(result.translations.en.image_url, /\/E91E63\.png\?/);
  assert.ok(!result.translations.en.image_url.includes("\\&"));
  assert.ok(result.translations.en.image_url.includes("&font=roboto"));

  // Rejects SVG
  assert.throws(
    () =>
      normalizeCarousel({
        ...baseInput,
        image_url_en: "https://example.com/vector-banner.svg",
      }),
    /SVG images are not supported by the mobile app/
  );
});


