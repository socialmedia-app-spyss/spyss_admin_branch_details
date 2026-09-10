import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEvent,
  generateEventCode,
  buildLocalizedObject,
  validateEnglishEventText,
  validateKannadaEventText,
} from "./normalizeEvent.ts";
import type { AppEventInput } from "../../types/event";

test("buildLocalizedObject creates object with present languages", () => {
  assert.deepEqual(buildLocalizedObject("English", "Kannada"), { en: "English", kn: "Kannada" });
  assert.deepEqual(buildLocalizedObject("English", "  "), { en: "English" });
  assert.deepEqual(buildLocalizedObject("", "Kannada"), { kn: "Kannada" });
  assert.deepEqual(buildLocalizedObject("  ", undefined), {});
});

test("generateEventCode creates uppercase slug with year and random suffix", () => {
  const code = generateEventCode("State Level Yoga Camp");
  assert.ok(code.startsWith("EVT-"));
  assert.ok(code.includes("STATE-LEVEL-YOGA-CAMP"));
});

test("normalizeEvent correctly structures JSONB and scalars", () => {
  const input: AppEventInput = {
    event_code: "EVT-2026-YOGA-001",
    version: 1,
    category: "CAMP",
    title_en: "Annual Yoga Camp",
    title_kn: "ವಾರ್ಷಿಕ ಯೋಗ ಶಿಬಿರ",
    short_description_en: "3-day immersive yoga retreat",
    short_description_kn: "3 ದಿನಗಳ ಯೋಗ ಶಿಬಿರ",
    full_description_en: "Comprehensive yoga workshops and sessions.",
    full_description_kn: "ಸಮಗ್ರ ಯೋಗ ತರಬೇತಿ.",
    location_name_en: "SPYSS Hall",
    location_name_kn: "ಎಸ್.ಪಿ.ವೈ.ಎಸ್.ಎಸ್ ಸಭಾಂಗಣ",
    address_en: "Bengaluru, Karnataka",
    address_kn: "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ",
    map_url: "https://maps.google.com/?q=12.9,77.5",
    registration_link: "https://example.com/register",
    contact_person_en: "Kishan",
    contact_person_kn: "ಕಿಶನ್",
    contact_phone: "+919876543210",
    image_url_en: "https://example.com/banner_en.webp",
    image_url_kn: "https://example.com/banner_kn.webp",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-03T18:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-15T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  const normalized = normalizeEvent(input);

  assert.equal(normalized.event_code, "EVT-2026-YOGA-001");
  assert.equal(normalized.category, "CAMP");
  assert.deepEqual(normalized.title, { en: "Annual Yoga Camp", kn: "ವಾರ್ಷಿಕ ಯೋಗ ಶಿಬಿರ" });
  assert.deepEqual(normalized.location_name, { en: "SPYSS Hall", kn: "ಎಸ್.ಪಿ.ವೈ.ಎಸ್.ಎಸ್ ಸಭಾಂಗಣ" });
  assert.deepEqual(normalized.image_url, { en: "https://example.com/banner_en.webp", kn: "https://example.com/banner_kn.webp" });
  assert.equal(normalized.map_url, "https://maps.google.com/?q=12.9,77.5");
  assert.equal(normalized.contact_phone, "+919876543210");
  assert.equal(normalized.send_announcement_push, true);
  assert.equal(normalized.is_active, true);
});

test("normalizeEvent throws if title is missing in both languages", () => {
  const input: AppEventInput = {
    event_code: "EVT-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "   ",
    title_kn: "",
    short_description_en: "",
    short_description_kn: "",
    full_description_en: "",
    full_description_kn: "",
    location_name_en: "",
    location_name_kn: "",
    address_en: "",
    address_kn: "",
    contact_person_en: "",
    contact_person_kn: "",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  assert.throws(() => normalizeEvent(input), {
    message: "Event title in either English or Kannada is required.",
  });
});

test("normalizeEvent throws if end datetime is before start datetime", () => {
  const input: AppEventInput = {
    event_code: "EVT-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "Yoga Camp",
    title_kn: "",
    short_description_en: "",
    short_description_kn: "",
    full_description_en: "",
    full_description_kn: "",
    location_name_en: "",
    location_name_kn: "",
    address_en: "",
    address_kn: "",
    contact_person_en: "",
    contact_person_kn: "",
    start_datetime: "2026-10-05T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  assert.throws(() => normalizeEvent(input), {
    message: "Event end date & time cannot be before start date & time.",
  });
});

test("validateEnglishEventText allows English letters, numbers and punctuation, but rejects Kannada", () => {
  assert.equal(validateEnglishEventText("State Level Yoga Shibira 2026", "Title"), true);
  assert.equal(validateEnglishEventText("#12, 5th Main, Malleshwaram", "Address"), true);
  assert.equal(
    validateEnglishEventText("ಯೋಗ ಶಿಬಿರ", "Title"),
    "Title cannot contain Kannada characters. Please enter English text only."
  );
  assert.equal(
    validateEnglishEventText("Yoga ಶಿಬಿರ", "Title"),
    "Title cannot contain Kannada characters. Please enter English text only."
  );
  assert.equal(
    validateEnglishEventText("2026-10-01", "Title"),
    "Title must contain English letters."
  );
});

test("validateKannadaEventText allows Kannada script and English numbers, but rejects English letters", () => {
  assert.equal(validateKannadaEventText("ರಾಜ್ಯ ಮಟ್ಟದ ಯೋಗ ಶಿಬಿರ 2026", "Title"), true);
  assert.equal(validateKannadaEventText("ವಿಶೇಷ ತರಬೇತಿ #12", "Title"), true);
  assert.equal(
    validateKannadaEventText("Yoga ಶಿಬಿರ", "Title"),
    "Title cannot contain English letters (English numbers 0-9 are allowed)."
  );
  assert.equal(
    validateKannadaEventText("fghjjj", "Title"),
    "Title cannot contain English letters (English numbers 0-9 are allowed)."
  );
  assert.equal(
    validateKannadaEventText("2026", "Title"),
    "Title must contain Kannada characters."
  );
});

test("normalizeEvent throws when Kannada field contains English letters", () => {
  const input: AppEventInput = {
    event_code: "EVT-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "State Yoga Camp",
    title_kn: "Yoga ಶಿಬಿರ fghjjj",
    short_description_en: "",
    short_description_kn: "",
    full_description_en: "",
    full_description_kn: "",
    location_name_en: "",
    location_name_kn: "",
    address_en: "",
    address_kn: "",
    contact_person_en: "",
    contact_person_kn: "",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  assert.throws(() => normalizeEvent(input), {
    message: "Kannada Title cannot contain English letters (English numbers 0-9 are allowed).",
  });
});

test("normalizeEvent throws when English field contains Kannada characters", () => {
  const input: AppEventInput = {
    event_code: "EVT-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "State Yoga ಶಿಬಿರ",
    title_kn: "",
    short_description_en: "",
    short_description_kn: "",
    full_description_en: "",
    full_description_kn: "",
    location_name_en: "",
    location_name_kn: "",
    address_en: "",
    address_kn: "",
    contact_person_en: "",
    contact_person_kn: "",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  assert.throws(() => normalizeEvent(input), {
    message: "English Title cannot contain Kannada characters. Please enter English text only.",
  });
});

test("normalizeEvent accepts Kannada content containing English numbers", () => {
  const input: AppEventInput = {
    event_code: "EVT-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "",
    title_kn: "ರಾಜ್ಯ ಮಟ್ಟದ ಯೋಗ ಶಿಬಿರ 2026",
    short_description_en: "",
    short_description_kn: "ಬೆಳಿಗ್ಗೆ 6:00 ಗಂಟೆಗೆ",
    full_description_en: "",
    full_description_kn: "2026 ರ ಸಮಗ್ರ ಯೋಗ ತರಬೇತಿ",
    location_name_en: "",
    location_name_kn: "ಎಸ್.ಪಿ.ವೈ.ಎಸ್.ಎಸ್ ಸಭಾಂಗಣ 560003",
    address_en: "",
    address_kn: "#12, 5ನೇ ಮುಖ್ಯ ರಸ್ತೆ",
    contact_person_en: "",
    contact_person_kn: "ಶ್ರೀ ರಮೇಶ್ ಕುಮಾರ್",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  const normalized = normalizeEvent(input);
  assert.equal(normalized.title.kn, "ರಾಜ್ಯ ಮಟ್ಟದ ಯೋಗ ಶಿಬಿರ 2026");
  assert.equal(normalized.short_description.kn, "ಬೆಳಿಗ್ಗೆ 6:00 ಗಂಟೆಗೆ");
});

test("normalizeEvent auto-sanitizes placehold.co URL and rejects SVG images", () => {
  const baseInput: AppEventInput = {
    event_code: "EVT-IMG-TEST",
    version: 1,
    category: "GENERAL",
    title_en: "State Yoga Shibira",
    title_kn: "",
    short_description_en: "Annual event",
    short_description_kn: "",
    full_description_en: "",
    full_description_kn: "",
    location_name_en: "",
    location_name_kn: "",
    address_en: "",
    address_kn: "",
    contact_person_en: "",
    contact_person_kn: "",
    start_datetime: "2026-10-01T06:00:00Z",
    end_datetime: "2026-10-01T08:00:00Z",
    event_timezone: "Asia/Kolkata",
    visible_from: "2026-09-01T00:00:00Z",
    send_announcement_push: true,
    is_active: true,
  };

  // placehold.co URL without extension and with markdown escaped ampersand
  const rawUrl =
    "https://placehold.co/1200x630/FFF0F5/E91E63?text=Happy+Birthday%21%0AWishing+You+a+Wonderful+Day%21\\&font=roboto";

  const result = normalizeEvent({
    ...baseInput,
    image_url_en: rawUrl,
  });

  assert.ok(result.image_url?.en);
  assert.match(result.image_url.en, /\/E91E63\.png\?/);
  assert.ok(!result.image_url.en.includes("\\&"));
  assert.ok(result.image_url.en.includes("&font=roboto"));

  // Reject SVG image
  assert.throws(
    () =>
      normalizeEvent({
        ...baseInput,
        image_url_en: "https://example.com/vector.svg",
      }),
    /SVG images are not supported by the mobile app/
  );
});


