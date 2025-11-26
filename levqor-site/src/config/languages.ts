// ------------------------------------------------------------
// Levqor — 9-language configuration (final, stable version)
// + Compatibility helpers for legacy components
// ------------------------------------------------------------

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
  { code: "zh-Hans", name: "简体中文" }
];

// ------------------------------------------------------------
// REQUIRED LEGACY EXPORTS
// These are used by AIHelpPanel + AIDebugAssistant.
// They MUST exist or Vercel fails to build.
// ------------------------------------------------------------

export function hasFullTranslations(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(l => l.code === code);
}

export function getCurrentLanguageCode(code: string): string {
  return SUPPORTED_LANGUAGES.some(l => l.code === code) ? code : "en";
}