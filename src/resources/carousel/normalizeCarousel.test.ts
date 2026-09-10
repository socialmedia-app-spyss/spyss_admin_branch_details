import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCarousel, getCarouselScheduleStatus } from "./normalizeCarousel.ts";
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
