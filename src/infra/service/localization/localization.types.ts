export const SUPPORTED_LOCALES = ["en", "he"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizationDirection = "ltr" | "rtl";

export type TranslationParams = Record<string, string | number | boolean | null | undefined>;

export interface ILocalizationService {
    getLocale: () => SupportedLocale;
    getDirection: () => LocalizationDirection;
    setLocale: (locale: SupportedLocale) => void;
    t: (key: string, params?: TranslationParams, fallback?: string) => string;
}
