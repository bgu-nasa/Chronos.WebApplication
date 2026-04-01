import { Fragment, useEffect, type ReactNode } from "react";
import { applyLocalizedResourceLocale } from "./localization-resource-overrides";
import { useLocalizationStore } from "./localization.store";

interface LocalizationProviderProps {
    readonly children: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
    const locale = useLocalizationStore((state) => state.locale);
    const direction = useLocalizationStore((state) => state.direction);

    useEffect(() => {
        applyLocalizedResourceLocale(locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = direction;
        document.body.dir = direction;
    }, [locale, direction]);

    return <Fragment key={locale}>{children}</Fragment>;
}
