import type { AppConfig, AppConfigInput, Platform } from "../../types/appConfig";

export const DEFAULT_MAINTENANCE_TITLE = "Under Maintenance";
export const DEFAULT_MAINTENANCE_MESSAGE =
  "The SPYSS App is temporarily unavailable. Please try again shortly.";
export const DEFAULT_UPDATE_TITLE = "Update Required";
export const DEFAULT_UPDATE_MESSAGE = "Please update the SPYSS App to continue.";

export const DEFAULT_ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=org.spyss.app";
export const DEFAULT_IOS_STORE_URL =
  "https://apps.apple.com/app/spyss/id6446219356";

export const getDefaultAppConfig = (platform: Platform): AppConfig => ({
  platform,
  is_app_running: true,
  force_update_active: false,
  min_build_number: 1,
  maintenance_title: DEFAULT_MAINTENANCE_TITLE,
  maintenance_message: DEFAULT_MAINTENANCE_MESSAGE,
  update_title: DEFAULT_UPDATE_TITLE,
  update_message: DEFAULT_UPDATE_MESSAGE,
  store_url: platform === "android" ? DEFAULT_ANDROID_STORE_URL : DEFAULT_IOS_STORE_URL,
});

export const normalizeAppConfig = (input: AppConfigInput): AppConfig => {
  const platform = input.platform === "ios" ? "ios" : "android";

  let minBuildNumber =
    typeof input.min_build_number === "number"
      ? Math.floor(input.min_build_number)
      : parseInt(String(input.min_build_number || "1").trim(), 10);

  if (isNaN(minBuildNumber) || minBuildNumber < 1) {
    minBuildNumber = 1;
  }

  const storeUrl = (input.store_url || "").trim();
  if (!storeUrl) {
    throw new Error("Store URL is required and cannot be empty.");
  }

  return {
    platform,
    is_app_running: Boolean(input.is_app_running),
    force_update_active: Boolean(input.force_update_active),
    min_build_number: minBuildNumber,
    maintenance_title: (input.maintenance_title || "").trim() || DEFAULT_MAINTENANCE_TITLE,
    maintenance_message: (input.maintenance_message || "").trim() || DEFAULT_MAINTENANCE_MESSAGE,
    update_title: (input.update_title || "").trim() || DEFAULT_UPDATE_TITLE,
    update_message: (input.update_message || "").trim() || DEFAULT_UPDATE_MESSAGE,
    store_url: storeUrl,
  };
};
