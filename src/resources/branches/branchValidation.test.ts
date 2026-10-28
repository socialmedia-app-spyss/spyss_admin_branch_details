import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isKarnatakaState,
  validateValaya,
  normalizeValayaId,
} from "./branchValidation.ts";

describe("Branch Form & Valaya Validation", () => {
  const mockStates = [
    { id: "state-ka-uuid", state_name_en: "Karnataka", state_code: "KA" },
    { id: "state-kl-uuid", state_name_en: "Kerala", state_code: "KL" },
    { id: "state-mh-uuid", state_name_en: "Maharashtra", state_code: "MH" },
    { id: "state-tn-uuid", state_name_en: "Tamil Nadu", state_code: "TN" },
    { id: "state-ap-uuid", state_name_en: "Andhra Pradesh", state_code: "AP" },
  ];

  describe("isKarnatakaState helper", () => {
    it("correctly identifies Karnataka by state ID", () => {
      assert.equal(isKarnatakaState("state-ka-uuid", mockStates), true);
    });

    it("correctly identifies Karnataka by state code", () => {
      assert.equal(isKarnatakaState("KA", mockStates), true);
      assert.equal(isKarnatakaState("ka", mockStates), true);
      assert.equal(isKarnatakaState("KAR", mockStates), true);
      assert.equal(isKarnatakaState("kar", mockStates), true);
    });

    it("returns false for non-Karnataka states", () => {
      assert.equal(isKarnatakaState("state-kl-uuid", mockStates), false);
      assert.equal(isKarnatakaState("state-mh-uuid", mockStates), false);
      assert.equal(isKarnatakaState("state-tn-uuid", mockStates), false);
      assert.equal(isKarnatakaState("state-ap-uuid", mockStates), false);
      assert.equal(isKarnatakaState("KL", mockStates), false);
      assert.equal(isKarnatakaState("MH", mockStates), false);
    });

    it("returns false when stateId is empty or undefined", () => {
      assert.equal(isKarnatakaState("", mockStates), false);
      assert.equal(isKarnatakaState(undefined, mockStates), false);
      assert.equal(isKarnatakaState("unknown-uuid", mockStates), false);
    });
  });

  describe("Valaya validation rule logic", () => {
    it("requires Valaya for Karnataka branches", () => {
      assert.equal(
        validateValaya("", true),
        "Select a Valaya and district combination."
      );
      assert.equal(
        validateValaya(null, true),
        "Select a Valaya and district combination."
      );
      assert.equal(
        validateValaya(undefined, true),
        "Select a Valaya and district combination."
      );
      assert.equal(validateValaya("valaya-uuid-1", true), true);
    });

    it("requires Valaya for non-Karnataka branches", () => {
      assert.equal(validateValaya("", false), "Select a Valaya and district combination.");
      assert.equal(validateValaya(null, false), "Select a Valaya and district combination.");
      assert.equal(validateValaya(undefined, false), "Select a Valaya and district combination.");
      assert.equal(validateValaya("valaya-uuid-1", false), true);
    });
  });

  describe("Payload valaya_id sanitization", () => {
    it("normalizes empty string and whitespace to null", () => {
      assert.equal(normalizeValayaId(""), null);
      assert.equal(normalizeValayaId("   "), null);
      assert.equal(normalizeValayaId(null), null);
      assert.equal(normalizeValayaId(undefined), null);
    });

    it("preserves valid valaya_id string", () => {
      assert.equal(
        normalizeValayaId("c2d82bb6-1d11-4f36-8c45-21d743a1cf55"),
        "c2d82bb6-1d11-4f36-8c45-21d743a1cf55"
      );
    });
  });
});
