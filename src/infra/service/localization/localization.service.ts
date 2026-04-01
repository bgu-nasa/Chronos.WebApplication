import { useLocalizationStore } from "./localization.store";
import type { ILocalizationService, SupportedLocale } from "./localization.types";

class LocalizationService implements ILocalizationService {
    getLocale(): SupportedLocale {
        return useLocalizationStore.getState().locale;
    }

    getDirection() {
        return useLocalizationStore.getState().direction;
    }

    setLocale(locale: SupportedLocale): void {
        useLocalizationStore.getState().setLocale(locale);
    }

    t(key: string, params?: Record<string, string | number | boolean | null | undefined>, fallback?: string): string {
        return useLocalizationStore.getState().t(key, params, fallback);
    }
}

export const localizationService = new LocalizationService();
