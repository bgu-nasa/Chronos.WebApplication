import { useLocalizationStore } from "./localization.store";

export function useLocalization() {
    const locale = useLocalizationStore((state) => state.locale);
    const direction = useLocalizationStore((state) => state.direction);
    const setLocale = useLocalizationStore((state) => state.setLocale);
    const t = useLocalizationStore((state) => state.t);

    return {
        locale,
        direction,
        isRtl: direction === "rtl",
        setLocale,
        t,
    };
}
