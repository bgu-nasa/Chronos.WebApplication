import type {
    NavigationItem,
    NavigationModuleKey,
} from "@/infra/federation/module.types";
import { translatedResources } from "./index";
import scheduleNavigationJson from "../../modules/schedule/navigation.resources.json";
import resourcesNavigationJson from "../../modules/resources/navigation.resources.json";
import managementNavigationJson from "../../modules/management/navigation.resources.json";
import authNavigationJson from "../../modules/auth/navigation.resources.json";
import homeNavigationJson from "../../modules/home/navigation.resources.json";

type NavigationLabels = {
    labels: Record<string, string>;
};

const moduleNavigation: Record<NavigationModuleKey, NavigationLabels> = {
    schedule: translatedResources(
        "src/modules/schedule/navigation.resources.json",
        scheduleNavigationJson,
    ) as NavigationLabels,
    resources: translatedResources(
        "src/modules/resources/navigation.resources.json",
        resourcesNavigationJson,
    ) as NavigationLabels,
    management: translatedResources(
        "src/modules/management/navigation.resources.json",
        managementNavigationJson,
    ) as NavigationLabels,
    auth: translatedResources(
        "src/modules/auth/navigation.resources.json",
        authNavigationJson,
    ) as NavigationLabels,
    home: translatedResources(
        "src/modules/home/navigation.resources.json",
        homeNavigationJson,
    ) as NavigationLabels,
};

function inferModuleFromHref(href?: string): NavigationModuleKey | null {
    if (!href) {
        return null;
    }

    const segment = href.split("/").filter(Boolean)[0];

    if (segment === "dashboard") {
        return "home";
    }

    if (
        segment === "schedule"
        || segment === "resources"
        || segment === "management"
        || segment === "auth"
    ) {
        return segment;
    }

    return null;
}

function resolveNavigationLabel(item: NavigationItem): string {
    const moduleKey = item.navigationModule ?? inferModuleFromHref(item.href);
    const labelKey = item.labelKey;

    if (!moduleKey || !labelKey) {
        return item.label;
    }

    const labels = moduleNavigation[moduleKey]?.labels;
    const translated = labels?.[labelKey];

    return typeof translated === "string" ? translated : item.label;
}

function translateNavigationItem(item: NavigationItem): NavigationItem {
    const children = item.children?.map(translateNavigationItem);

    return {
        ...item,
        label: resolveNavigationLabel(item),
        children,
    };
}

export function translateNavigationItems(
    items: NavigationItem[],
): NavigationItem[] {
    return items.map(translateNavigationItem);
}
