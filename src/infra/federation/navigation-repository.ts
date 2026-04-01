/** @author aaron-iz */
import { ApplicationModuleRepository } from "./module-repository";
import type { NavigationItem } from "./module.types";
import { localizationService } from "@/infra/service/localization";

const NAVIGATION_LABEL_KEYS: Record<string, string> = {
    Login: "navigation.label.login",
    Users: "navigation.label.users",
    Home: "navigation.label.home",
    Resources: "navigation.label.resources",
    Courses: "navigation.label.courses",
    Rooms: "navigation.label.rooms",
    Management: "navigation.label.management",
    Departments: "navigation.label.departments",
    "Access Control": "navigation.label.accessControl",
    "Organization Settings": "navigation.label.organizationSettings",
    Schedule: "navigation.label.schedule",
    Calendar: "navigation.label.calendar",
    Semesters: "navigation.label.semesters",
    Constraints: "navigation.label.constraints",
};

export class NavigationRepository {
    private localizeNavigationItem(item: NavigationItem): NavigationItem {
        const translationKey = NAVIGATION_LABEL_KEYS[item.label];
        const localizedLabel = translationKey
            ? localizationService.t(translationKey, undefined, item.label)
            : item.label;

        return {
            ...item,
            label: localizedLabel,
            children: item.children?.map((child) => this.localizeNavigationItem(child)),
        };
    }

    private loadNavigationItems(): NavigationItem[] {
        const moduleConfigs = ApplicationModuleRepository.getModules();
        return (
            moduleConfigs
                .flatMap((mc) => mc.navigationItems)
                .map((item) => this.localizeNavigationItem(item)) || []
        );
    }

    /**
     * @returns All navigation items from all modules
     */
    getAllNavigationItems(): NavigationItem[] {
        return this.loadNavigationItems();
    }

    /**
     * @param location - The location to filter by
     * @returns Navigation items for a specific location
     */
    getNavigationItemsByLocation(
        location: "dashboard" | "public" | "admin"
    ): NavigationItem[] {
        return this.loadNavigationItems()
            .filter((item) => item.location === location)
            .sort((a, b) => {
                if (a.order == null && b.order == null) return 0;
                if (a.order == null) return 1; // a goes last
                if (b.order == null) return -1; // b goes last
                return a.order - b.order;
            });
    }

    /**
     * @returns Navigation items for the dashboard
     */
    getDashboardNavigationItems(): NavigationItem[] {
        return this.getNavigationItemsByLocation("dashboard");
    }

    /**
     * @returns Navigation items for public pages
     */
    getPublicNavigationItems(): NavigationItem[] {
        return this.getNavigationItemsByLocation("public");
    }

    /**
     * @returns Navigation items for admin pages
     */
    getAdminNavigationItems(): NavigationItem[] {
        return this.getNavigationItemsByLocation("admin");
    }
}

export const ApplicationNavigationRepository = new NavigationRepository();
