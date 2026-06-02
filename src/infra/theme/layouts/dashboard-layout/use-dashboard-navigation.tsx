/** @author aaron-iz */
import { useMemo } from "react";
import { ApplicationNavigationRepository } from "@/infra/federation/navigation-repository";
import type { NavigationItem } from "@/infra/federation/module.types";
import { translateNavigationItems } from "@/infra/i18n/translate-navigation";
import { useLocaleStore } from "@/infra/theme/state";

/**
 * Hook to retrieve dashboard navigation items from all module configs
 * @returns Navigation items with location "dashboard"
 */
export function useDashboardNavigation(): NavigationItem[] {
    const language = useLocaleStore((state) => state.language);

    return useMemo(() => {
        const items =
            ApplicationNavigationRepository.getDashboardNavigationItems();

        return translateNavigationItems(items, language);
    }, [language]);
}
