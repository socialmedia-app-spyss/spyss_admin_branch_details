import test from "node:test";
import assert from "node:assert/strict";
import { normalizePanchanga } from "./normalize.ts";
import type { AppPanchangaInput } from "../../types/panchanga";

test("normalizePanchanga normalizes language, dates, and optional notes", () => {
  const input: AppPanchangaInput = {
    language: "  KN  ",
    panchanga_date: "2026-10-15",
    krishna_shaka_year: 5127,
    shalivahana_shaka_year: 1948,
    kali_yuga_year: 28,
    samvatsara: "  ಕ್ರೋಧೀ  ",
    ayana: "  ದಕ್ಷಿಣಾಯನ  ",
    rutu: "  ಶರದ್  ",
    masa: "  ಆಶ್ವಯುಜ  ",
    paksha: "  ಶುಕ್ಲ  ",
    tithi: "  ದಶಮೀ  ",
    vasara: "  ಬೃಹಸ್ಪತಿವಾಸರಃ  ",
    weekday: "  ಗುರುವಾರ  ",
    nakshatra: "  ಶ್ರವಣ  ",
    yoga: "  ಸುಕರ್ಮ  ",
    karana: "  ಗರಜ  ",
    display_date: "",
    special_note: "  ವಿಜಯದಶಮಿ  ",
    special_note2: "   ",
    special_note3: null,
    approve_status: true,
    is_active: true,
    image_generation_status: "PENDING",
    image_version: 1,
  };

  const result = normalizePanchanga(input);

  assert.equal(result.language, "kn");
  assert.equal(result.samvatsara, "ಕ್ರೋಧೀ");
  assert.equal(result.tithi, "ದಶಮೀ");
  assert.equal(result.special_note, "ವಿಜಯದಶಮಿ");
  assert.equal(result.special_note2, null);
  assert.equal(result.special_note3, null);
  assert.equal(result.approve_status, true);
  assert.equal(result.is_active, true);
  assert.equal(result.image_generation_status, "PENDING");
  assert.ok(result.display_date);
});
