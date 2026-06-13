/** @author aaron-iz */
import { ActionIcon, useMantineTheme } from "@mantine/core";
import { useThemeStore } from "../../state";
import { MoonIcon, SunIcon } from "../../../../common/icons";
import { translatedResources } from "@/infra/i18n";
import resourcesJson from "./theme-toggle-button.resources.json";

const resources = translatedResources(
    "src/infra/theme/components/theme-toggle-button/theme-toggle-button.resources.json",
    resourcesJson,
);

export const ThemeToggleButton = () => {
    const { colorScheme, toggleColorScheme } = useThemeStore();
    const theme = useMantineTheme();
    const isDark = colorScheme === "dark";

    return (
        <ActionIcon
            onClick={toggleColorScheme}
            variant="default"
            size="lg"
            aria-label={resources.label}
            c={theme.primaryColor}
        >
            {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </ActionIcon>
    );
};

