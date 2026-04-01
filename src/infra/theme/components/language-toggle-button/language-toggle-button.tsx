import { ActionIcon, useMantineTheme } from "@mantine/core";
import { useLocalization } from "@/infra/service";

export const LanguageToggleButton = () => {
    const { locale, setLocale, t } = useLocalization();
    const theme = useMantineTheme();

    const isEnglish = locale === "en";

    return (
        <ActionIcon
            onClick={() => setLocale(isEnglish ? "he" : "en")}
            variant="default"
            size="lg"
            aria-label={
                isEnglish
                    ? t("localization.switch.he", undefined, "Switch language to Hebrew")
                    : t("localization.switch.en", undefined, "Switch language to English")
            }
            c={theme.primaryColor}
        >
            {isEnglish ? "HE" : "EN"}
        </ActionIcon>
    );
};
