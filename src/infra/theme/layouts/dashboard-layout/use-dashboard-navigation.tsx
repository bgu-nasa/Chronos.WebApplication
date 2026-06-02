/** @author aaron-iz */
import { useMemo } from "react";
import { ApplicationNavigationRepository } from "@/infra/federation/navigation-repository";
import type { NavigationItem } from "@/infra/federation/module.types";

/**
 * Hook to retrieve dashboard navigation items from all module configs
 * @returns Navigation items with location "dashboard"
 */
export function useDashboardNavigation(): NavigationItem[] {
    return useMemo(() => {
        return ApplicationNavigationRepository.getDashboardNavigationItems();
    }, []);
}
