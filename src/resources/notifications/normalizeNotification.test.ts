import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeNotification,
  generateNotificationCode,
  validateEnglishNotificationText,
  validateKannadaNotificationText,
} from "./normalizeNotification.ts";
import type { AppNotificationInput } from "../../types/notification";

test("generateNotificationCode formats code properly", () => {
  const code = generateNotificationCode("Gurupoornima Celebration");
  assert.ok(code.startsWith("NOTIF-"));
  assert.ok(code.includes("GURUPOORNIMA"));
});

test("normalizeNotification creates valid JSONB and targeting payloads", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-2026-YOGA-001",
    version: 1,
    priority: "HIGH",
    type: "EVENT",
    target_type: "VALAYA",
    target_valaya_id: "val-bengaluru-north",
    title_en: "Special Yoga Shibira",
    body_en: "Join us this Sunday for a special morning session.",
    title_kn: "ವಿಶೇಷ ಯೋಗ ಶಿಬಿರ",
    body_kn: "ಈ ಭಾನುವಾರ ವಿಶೇಷ ತರಬೇತಿಗೆ ಭಾಗವಹಿಸಿ.",
    image_url: "https://example.com/notif_banner.webp",
    action_type: "OPEN_URL",
    action_url: "https://spyss.org/events",
    date_time: "2026-10-01T06:00:00Z",
    expiry_date: "2026-10-02T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  const result = normalizeNotification(input);

  assert.equal(result.notification_code, "NOTIF-2026-YOGA-001");
  assert.equal(result.priority, "HIGH");
  assert.equal(result.type, "EVENT");
  assert.equal(result.target_type, "VALAYA");
  assert.deepEqual(result.target_payload, { valaya_id: "val-bengaluru-north" });
  assert.deepEqual(result.title, { en: "Special Yoga Shibira", kn: "ವಿಶೇಷ ಯೋಗ ಶಿಬಿರ" });
  assert.deepEqual(result.body, {
    en: "Join us this Sunday for a special morning session.",
    kn: "ಈ ಭಾನುವಾರ ವಿಶೇಷ ತರಬೇತಿಗೆ ಭಾಗವಹಿಸಿ.",
  });
  assert.equal(result.image_url, "https://example.com/notif_banner.webp");
  assert.equal(result.action_type, "OPEN_URL");
  assert.deepEqual(result.action_payload, { url: "https://spyss.org/events" });
  assert.equal(result.is_active, true);
});

test("normalizeNotification succeeds with Kannada-only content", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-KN-ONLY",
    version: 1,
    priority: "NORMAL",
    type: "ANNOUNCEMENT",
    target_type: "ALL",
    title_en: "",
    body_en: "",
    title_kn: "ಮುಖ್ಯ ಸೂಚನೆ",
    body_kn: "ಯೋಗಾಸನ ಅಭ್ಯಾಸದ ವೇಳಾಪಟ್ಟಿ ಬದಲಾಗಿದೆ.",
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  const result = normalizeNotification(input);
  assert.deepEqual(result.title, { kn: "ಮುಖ್ಯ ಸೂಚನೆ" });
  assert.deepEqual(result.body, { kn: "ಯೋಗಾಸನ ಅಭ್ಯಾಸದ ವೇಳಾಪಟ್ಟಿ ಬದಲಾಗಿದೆ." });
});

test("normalizeNotification throws when content is incomplete", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-INCOMPLETE",
    version: 1,
    priority: "NORMAL",
    type: "GENERAL",
    target_type: "ALL",
    title_en: "English Title",
    body_en: "", // missing English body
    title_kn: "",
    body_kn: "Kannada Body", // missing Kannada title
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  assert.throws(() => normalizeNotification(input), {
    message: "Notification requires complete content (Title & Body) in either English or Kannada.",
  });
});

test("normalizeNotification throws when expiry date is before or equal to scheduled date", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-DATE-ERR",
    version: 1,
    priority: "NORMAL",
    type: "GENERAL",
    target_type: "ALL",
    title_en: "Notice",
    body_en: "Body text",
    title_kn: "",
    body_kn: "",
    date_time: "2026-10-05T06:00:00Z",
    expiry_date: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  assert.throws(() => normalizeNotification(input), {
    message: "Expiry date must be later than the scheduled event/dispatch date & time.",
  });
});

test("validateEnglishNotificationText allows English letters, numbers and punctuation, but rejects Kannada", () => {
  assert.equal(validateEnglishNotificationText("Special Yoga Shibira 2026!"), true);
  assert.equal(validateEnglishNotificationText("Starts at 6:00 AM, Call: 9876543210."), true);
  assert.match(
    validateEnglishNotificationText("ಯೋಗ ಶಿಬಿರ 2026") as string,
    /cannot contain Kannada characters/
  );
  assert.match(
    validateEnglishNotificationText("Workshop ಯೋಗ") as string,
    /cannot contain Kannada characters/
  );
  assert.match(
    validateEnglishNotificationText("12345") as string,
    /must contain English letters/
  );
});

test("validateKannadaNotificationText allows Kannada script and English numbers, but rejects English letters", () => {
  assert.equal(validateKannadaNotificationText("ವಿಶೇಷ ಯೋಗ ಶಿಬಿರ 2026"), true);
  assert.equal(validateKannadaNotificationText("ಬೆಳಿಗ್ಗೆ 6:00 ಗಂಟೆಗೆ ಪ್ರಾರಂಭ (ದೂರವಾಣಿ: 9876543210)."), true);
  assert.match(
    validateKannadaNotificationText("Yoga Workshop") as string,
    /cannot contain English letters/
  );
  assert.match(
    validateKannadaNotificationText("ವಿಶೇಷ Yoga ಶಿಬಿರ") as string,
    /cannot contain English letters/
  );
  assert.match(
    validateKannadaNotificationText("2026-10-01") as string,
    /must contain Kannada characters/
  );
});

test("normalizeNotification throws when Kannada field contains English letters", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-KN-ERR",
    version: 1,
    priority: "NORMAL",
    type: "GENERAL",
    target_type: "ALL",
    title_en: "",
    body_en: "",
    title_kn: "This is English in Kannada box",
    body_kn: "ವಿಶೇಷ ಯೋಗ ತರಬೇತಿ",
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  assert.throws(() => normalizeNotification(input), {
    message: /Kannada Title cannot contain English letters/,
  });
});

test("normalizeNotification throws when English field contains Kannada characters", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-EN-ERR",
    version: 1,
    priority: "NORMAL",
    type: "GENERAL",
    target_type: "ALL",
    title_en: "Special Yoga ಶಿಬಿರ",
    body_en: "English Body",
    title_kn: "",
    body_kn: "",
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  assert.throws(() => normalizeNotification(input), {
    message: /English Title cannot contain Kannada characters/,
  });
});

test("normalizeNotification accepts Kannada content containing English numbers", () => {
  const input: AppNotificationInput = {
    notification_code: "NOTIF-NUMS-OK",
    version: 1,
    priority: "NORMAL",
    type: "ANNOUNCEMENT",
    target_type: "ALL",
    title_en: "Yoga Day 2026 - Hall 2",
    body_en: "Session at 6:00 AM on 21st June.",
    title_kn: "ಯೋಗ ದಿನಾಚರಣೆ 2026 - ಸಭಾಂಗಣ 2",
    body_kn: "ಜೂನ್ 21 ರಂದು ಬೆಳಿಗ್ಗೆ 6:00 ಗಂಟೆಗೆ ಕಾರ್ಯಕ್ರಮ.",
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  const result = normalizeNotification(input);
  assert.equal(result.title.en, "Yoga Day 2026 - Hall 2");
  assert.equal(result.title.kn, "ಯೋಗ ದಿನಾಚರಣೆ 2026 - ಸಭಾಂಗಣ 2");
});

test("normalizeNotification auto-converts placehold.co URL and rejects SVG images", () => {
  const baseInput: AppNotificationInput = {
    notification_code: "NOTIF-IMG-TEST",
    version: 1,
    priority: "NORMAL",
    type: "GENERAL",
    target_type: "ALL",
    title_en: "Yoga Day 2026",
    body_en: "Celebration details",
    title_kn: "",
    body_kn: "",
    date_time: "2026-10-01T06:00:00Z",
    send_status: "PENDING",
    is_active: true,
  };

  const rawUrl =
    "https://placehold.co/1200x630/FFF0F5/E91E63?text=Happy+Birthday%21%0AWishing+You+a+Wonderful+Day%21\\&font=roboto";

  const result = normalizeNotification({
    ...baseInput,
    image_url: rawUrl,
  });

  assert.ok(result.image_url);
  assert.match(result.image_url, /\/E91E63\.png\?/);
  assert.ok(!result.image_url.includes("\\&"));
  assert.ok(result.image_url.includes("&font=roboto"));

  // Rejects SVG
  assert.throws(
    () =>
      normalizeNotification({
        ...baseInput,
        image_url: "https://example.com/vector-notif.svg",
      }),
    /SVG images are not supported by the mobile app/
  );
});

