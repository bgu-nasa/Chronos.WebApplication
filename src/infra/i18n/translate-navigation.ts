import type { NavigationItem } from "@/infra/federation/module.types";
import type { Language } from "@/infra/theme/state";
import { getTranslationNamespace, i18n } from "./index";
import scheduleNavigationJson from "../../modules/schedule/navigation.resources.json";
import resourcesNavigationJson from "../../modules/resources/navigation.resources.json";
import managementNavigationJson from "../../modules/management/navigation.resources.json";
import authNavigationJson from "../../modules/auth/navigation.resources.json";
import homeNavigationJson from "../../modules/home/navigation.resources.json";

type NavigationModuleKey =
    | "schedule"
    | "resources"
    | "management"
    | "auth"
    | "home";

const navigationSources: Record<
    NavigationModuleKey,
    { resourceKey: string; labels: Record<string, string> }
> = {
    schedule: {
        resourceKey: "src/modules/schedule/navigation.resources.json",
        labels: scheduleNavigationJson.labels,
    },
    resources: {
        resourceKey: "src/modules/resources/navigation.resources.json",
        labels: resourcesNavigationJson.labels,
    },
    management: {
        resourceKey: "src/modules/management/navigation.resources.json",
        labels: managementNavigationJson.labels,
    },
    auth: {
        resourceKey: "src/modules/auth/navigation.resources.json",
        labels: authNavigationJson.labels,
    },
    home: {
        resourceKey: "src/modules/home/navigation.resources.json",
        labels: homeNavigationJson.labels,
    },
};

const hrefToLabelKey: Record<string, { module: NavigationModuleKey; key: string }> =
    {
        "/schedule/calendar": { module: "schedule", key: "calendar" },
        "/schedule/scheduling-periods": { module: "schedule", key: "semesters" },
        "/schedule/constraints": { module: "schedule", key: "constraints" },
        "/schedule/assignments": { module: "schedule", key: "manageAssignments" },
        "/schedule/my-assignments": { module: "schedule", key: "myAssignments" },
        "/schedule/my-appeals": { module: "schedule", key: "myAppeals" },
        "/schedule/appeals": { module: "schedule", key: "appeals" },
        "/resources/subjects": { module: "resources", key: "courses" },
        "/resources/manage": { module: "resources", key: "rooms" },
        "/management/departments": { module: "management", key: "departments" },
        "/management/roles": { module: "management", key: "accessControl" },
        "/management/organization-settings": {
            module: "management",
            key: "organizationSettings",
        },
        "/dashboard/home": { module: "home", key: "home" },
        "/auth/users": { module: "auth", key: "users" },
    };

const parentModuleToLabelKey: Record<NavigationModuleKey, string> = {
    schedule: "schedule",
    resources: "resources",
    management: "management",
    auth: "users",
    home: "home",
};

function translateNavLabel(
    module: NavigationModuleKey,
    key: string,
    language: Language,
): string | undefined {
    const source = navigationSources[module];
    const fallback = source.labels[key];

    if (typeof fallback !== "string") {
        return undefined;
    }

    const namespace = getTranslationNamespace(source.resourceKey);

    return i18n.t(`${namespace}:labels.${key}`, {
        defaultValue: fallback,
        lng: language,
    });
}

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

function resolveNavigationLabel(
    item: NavigationItem,
    language: Language,
): string {
    if (item.href) {
        const mapping = hrefToLabelKey[item.href];

        if (mapping) {
            const translated = translateNavLabel(
                mapping.module,
                mapping.key,
                language,
            );

            if (typeof translated === "string") {
                return translated;
            }
        }
    } else if (item.children?.length) {
        const moduleKey = inferModuleFromHref(item.children[0]?.href);

        if (moduleKey) {
            const parentKey = parentModuleToLabelKey[moduleKey];
            const translated = translateNavLabel(moduleKey, parentKey, language);

            if (typeof translated === "string") {
                return translated;
            }
        }
    }

    return item.label;
}

function translateNavigationItem(
    item: NavigationItem,
    language: Language,
): NavigationItem {
    const children = item.children?.map((child) =>
        translateNavigationItem(child, language),
    );

    return {
        ...item,
        label: resolveNavigationLabel(item, language),
        children,
    };
}

export function translateNavigationItems(
    items: NavigationItem[],
    language: Language,
): NavigationItem[] {
    return items.map((item) => translateNavigationItem(item, language));
}
