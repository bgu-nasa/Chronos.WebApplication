import { create } from "zustand";
import { TRANSLATIONS } from "./localization.resources";
import { applyLocalizedResourceLocale } from "./localization-resource-overrides";
import type {
    SupportedLocale,
    LocalizationDirection,
    TranslationParams,
} from "./localization.types";

const STORAGE_KEY = "chronos.locale";

const getDirection = (locale: SupportedLocale): LocalizationDirection =>
    locale === "he" ? "rtl" : "ltr";

const isSupportedLocale = (value: string): value is SupportedLocale =>
    value === "en" || value === "he";

const getInitialLocale = (): SupportedLocale => {
    if (globalThis.window === undefined) {
        return "en";
    }

    const stored = globalThis.localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
        return stored;
    }

    const browserLocale = globalThis.navigator.language?.toLowerCase() || "en";
    return browserLocale.startsWith("he") ? "he" : "en";
};

const formatTemplate = (template: string, params?: TranslationParams): string => {
    if (!params) {
        return template;
    }

    let formatted = template;
    Object.entries(params).forEach(([key, value]) => {
        formatted = formatted.replaceAll(`{${key}}`, value == null ? `{${key}}` : String(value));
    });

    return formatted;
};

interface LocalizationState {
    locale: SupportedLocale;
    direction: LocalizationDirection;
    setLocale: (locale: SupportedLocale) => void;
    t: (key: string, params?: TranslationParams, fallback?: string) => string;
}

export const useLocalizationStore = create<LocalizationState>((set, get) => {
    const initialLocale = getInitialLocale();
    applyLocalizedResourceLocale(initialLocale);

    return {
        locale: initialLocale,
        direction: getDirection(initialLocale),
        setLocale: (locale: SupportedLocale) => {
            if (globalThis.window !== undefined) {
                globalThis.localStorage.setItem(STORAGE_KEY, locale);
            }

            applyLocalizedResourceLocale(locale);

            set({
                locale,
                direction: getDirection(locale),
            });
        },
        t: (key: string, params?: TranslationParams, fallback?: string) => {
            const { locale } = get();
            const localeValue = TRANSLATIONS[locale][key];
            const englishValue = TRANSLATIONS.en[key];
            const resolvedValue = localeValue || englishValue || fallback || key;

            return formatTemplate(resolvedValue, params);
        },
    };
});
