import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "he";
export type AppDirection = "ltr" | "rtl";

interface LocaleState {
    language: Language;
    direction: AppDirection;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
}

const getDirectionByLanguage = (language: Language): AppDirection =>
    language === "he" ? "rtl" : "ltr";

export const useLocaleStore = create<LocaleState>()(
    persist(
        (set, get) => ({
            language: "en",
            direction: "ltr",
            setLanguage: (language: Language) =>
                set({
                    language,
                    direction: getDirectionByLanguage(language),
                }),
            toggleLanguage: () => {
                const nextLanguage: Language =
                    get().language === "en" ? "he" : "en";

                set({
                    language: nextLanguage,
                    direction: getDirectionByLanguage(nextLanguage),
                });
            },
        }),
        {
            name: "locale-storage",
        },
    ),
);
