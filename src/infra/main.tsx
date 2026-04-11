/** @author aaron-iz */
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MantineProvider } from "@mantine/core";
import { PrimeReactProvider } from "primereact/api";
import { theme } from "./theme";
import { useLocaleStore, useThemeStore } from "./theme/state";
import { i18n, initializeI18n } from "./i18n";
import App from "./App";
import "@mantine/core/styles.css";
import "primereact/resources/primereact.min.css";
import "./theme/primereact-overrides.css";

initializeI18n("en");

const ThemedApp = () => {
    const colorScheme = useThemeStore((state) => state.colorScheme);
    const language = useLocaleStore((state) => state.language);
    const direction = useLocaleStore((state) => state.direction);

    useEffect(() => {
        // Dynamically load PrimeReact theme - hacky we store this locally instead of using the npm package, need to update on builds...
        const themeLink = document.getElementById(
            "primereact-theme",
        ) as HTMLLinkElement;
        const themePath =
            colorScheme === "dark"
                ? "/themes/lara-dark-indigo/theme.css"
                : "/themes/lara-light-indigo/theme.css";

        if (themeLink) {
            themeLink.href = themePath;
        } else {
            const link = document.createElement("link");
            link.id = "primereact-theme";
            link.rel = "stylesheet";
            link.href = themePath;
            document.head.appendChild(link);
        }
    }, [colorScheme]);
    
    useEffect(() => {
        document.documentElement.setAttribute("lang", language);
        document.documentElement.setAttribute("dir", direction);
    }, [language, direction]);

    useEffect(() => {
        void i18n.changeLanguage(language);
    }, [language]);
    
    return (
        <MantineProvider theme={theme} forceColorScheme={colorScheme}>
            <PrimeReactProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </PrimeReactProvider>
        </MantineProvider>
    );
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemedApp />
    </StrictMode>,
);
