import { useLanguageContext, type AppLanguage } from "../contexts/language";

/**
 * Returns the currently active UI language and a setter.
 * Defaults to "en" when no LanguageProvider is in the tree
 * (the context itself provides that default).
 */
export const useLanguage = (): { language: AppLanguage; setLanguage: (lang: AppLanguage) => void } =>
  useLanguageContext();
