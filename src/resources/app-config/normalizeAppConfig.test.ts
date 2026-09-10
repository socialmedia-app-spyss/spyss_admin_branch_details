import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAppConfig,
  getDefaultAppConfig,
  DEFAULT_MAINTENANCE_TITLE,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_UPDATE_TITLE,
  DEFAULT_UPDATE_MESSAGE,
} from "./normalizeAppConfig.ts";

test("getDefaultAppConfig returns correct defaults for android and ios", () => {
  const androidConfig = getDefaultAppConfig("android");
  assert.equal(androidConfig.platform, "android");
  assert.equal(androidConfig.is_app_running, true);
  assert.equal(androidConfig.force_update_active, false);
  assert.equal(androidConfig.min_build_number, 1);
  assert.equal(androidConfig.maintenance_title, DEFAULT_MAINTENANCE_TITLE);
  assert.equal(androidConfig.maintenance_message, DEFAULT_MAINTENANCE_MESSAGE);
  assert.equal(androidConfig.update_title, DEFAULT_UPDATE_TITLE);
  assert.equal(androidConfig.update_message, DEFAULT_UPDATE_MESSAGE);
  assert.ok(androidConfig.store_url.includes("play.google.com"));

  const iosConfig = getDefaultAppConfig("ios");
  assert.equal(iosConfig.platform, "ios");
  assert.ok(iosConfig.store_url.includes("apps.apple.com"));
});

test("normalizeAppConfig correctly parses and normalizes input", () => {
  const result = normalizeAppConfig({
    platform: "android",
    is_app_running: false,
    force_update_active: true,
    min_build_number: "42",
    maintenance_title: "  Server Maintenance  ",
    maintenance_message: "  Back soon  ",
    update_title: "  Critical Update  ",
    update_message: "  Update now  ",
    store_url: "  https://example.com/store  ",
  });

  assert.deepEqual(result, {
    platform: "android",
    is_app_running: false,
    force_update_active: true,
    min_build_number: 42,
    maintenance_title: "Server Maintenance",
    maintenance_message: "Back soon",
    update_title: "Critical Update",
    update_message: "Update now",
    store_url: "https://example.com/store",
  });
});

test("normalizeAppConfig falls back to defaults for empty titles and invalid build numbers", () => {
  const result = normalizeAppConfig({
    platform: "ios",
    is_app_running: true,
    force_update_active: false,
    min_build_number: -5,
    maintenance_title: "   ",
    maintenance_message: "   ",
    update_title: "   ",
    update_message: "   ",
    store_url: "https://apps.apple.com/app",
  });

  assert.equal(result.min_build_number, 1);
  assert.equal(result.maintenance_title, DEFAULT_MAINTENANCE_TITLE);
  assert.equal(result.maintenance_message, DEFAULT_MAINTENANCE_MESSAGE);
  assert.equal(result.update_title, DEFAULT_UPDATE_TITLE);
  assert.equal(result.update_message, DEFAULT_UPDATE_MESSAGE);
});

test("normalizeAppConfig throws when store_url is empty", () => {
  assert.throws(
    () => {
      normalizeAppConfig({
        platform: "android",
        is_app_running: true,
        force_update_active: false,
        min_build_number: 1,
        maintenance_title: "Maintenance",
        maintenance_message: "Message",
        update_title: "Update",
        update_message: "Message",
        store_url: "   ",
      });
    },
    { message: "Store URL is required and cannot be empty." }
  );
});
