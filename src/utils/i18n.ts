import type { AppLanguage } from "../contexts/language";

/**
 * Returns the localized string for a given language.
 * Falls back: preferred language → the other language → empty string.
 *
 * @example
 * getLocalizedName(state.state_name_en, state.state_name_kn, language)
 */
export const getLocalizedName = (
  english: string | null | undefined,
  kannada: string | null | undefined,
  language: AppLanguage,
): string => {
  if (language === "kn") {
    return kannada?.trim() || english?.trim() || "";
  }
  return english?.trim() || kannada?.trim() || "";
};

/**
 * Convenience overload that accepts any object with `*_name_en` / `*_name_kn`
 * fields, identified by a prefix.
 *
 * @example
 * getDisplayName(state, "state", language)  // reads state_name_en / state_name_kn
 */
export const getDisplayName = <T extends Record<string, unknown>>(
  item: T | null | undefined,
  prefix: string,
  language: AppLanguage,
): string => {
  if (!item) return "";
  const en = item[`${prefix}_name_en`];
  const kn = item[`${prefix}_name_kn`];
  return getLocalizedName(
    typeof en === "string" ? en : undefined,
    typeof kn === "string" ? kn : undefined,
    language,
  );
};
