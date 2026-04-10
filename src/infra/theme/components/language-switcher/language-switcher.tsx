import { Button, SegmentedControl, Stack, Text } from "@mantine/core";
import { type Language, useLocaleStore } from "@/infra/theme/state";
import resources from "./language-switcher.resources.json";

type LanguageSwitcherVariant = "compact" | "settings";

interface LanguageSwitcherProps {
    variant?: LanguageSwitcherVariant;
}

export const LanguageSwitcher = ({
    variant = "compact",
}: LanguageSwitcherProps) => {
    const language = useLocaleStore((state) => state.language);
    const setLanguage = useLocaleStore((state) => state.setLanguage);
    const toggleLanguage = useLocaleStore((state) => state.toggleLanguage);

    if (variant === "compact") {
        return (
            <Button
                variant="default"
                size="sm"
                onClick={toggleLanguage}
                aria-label={resources.aria.switchInterfaceLanguage}
            >
                {language.toUpperCase()}
            </Button>
        );
    }

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>
                {resources.interfaceLanguage}
            </Text>
            <SegmentedControl
                fullWidth
                value={language}
                onChange={(value) => setLanguage(value as Language)}
                data={[
                    { label: resources.languageLabels.en, value: "en" },
                    { label: resources.languageLabels.he, value: "he" },
                ]}
                aria-label={resources.aria.selectInterfaceLanguage}
            />
        </Stack>
    );
};
