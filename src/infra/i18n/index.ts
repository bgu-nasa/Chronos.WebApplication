import i18n from "i18next";
import { initReactI18next } from "react-i18next";

type Language = "en" | "he";

function normalizePath(value: string) {
    return value
        .replaceAll("\\", "/")
        .replace(/^\/+/, "")
        .replace(/^\.\//, "");
}

export function getTranslationNamespace(resourceKey: string) {
    const normalized = normalizePath(resourceKey);
    const filename = normalized
        .replace(/\.resources\.json$/, "")
        .replace(/\.generated\.json$/, "")
        .replace(/\.json$/, "")
        .split("/")
        .pop();

    const modulePageRegex = /^src\/modules\/([^/]+)\/src\/pages\/([^/]+)\//;
    const modulePageMatch = modulePageRegex.exec(normalized);

    if (modulePageMatch) {
        return `${modulePageMatch[1]}.${modulePageMatch[2]}.${filename}`;
    }

    const moduleRegex = /^src\/modules\/([^/]+)\//;
    const moduleMatch = moduleRegex.exec(normalized);

    if (moduleMatch) {
        return `${moduleMatch[1]}.${filename}`;
    }

    return filename ?? normalized;
}

function namespaceFromGeneratedPath(
    generatedPath: string,
    locale: Language,
): string {
    const normalizedPath = normalizePath(generatedPath);
    const match = new RegExp(
        String.raw`(?:^|/)locales/${locale}/([^/]+)/([^/]+)\.generated\.json$`,
    ).exec(normalizedPath);

    if (!match) {
        throw new Error(
            `Cannot derive translation namespace from generated path: ${generatedPath}`,
        );
    }

    const namespaceFolder = match[1];
    const generatedFileName = match[2];

    return `${namespaceFolder}.${generatedFileName}`;
}

const englishLocaleFiles = import.meta.glob<Record<string, unknown>>(
    "./locales/en/**/*.generated.json",
    {
        eager: true,
        import: "default",
    },
);

const hebrewLocaleFiles = import.meta.glob<Record<string, unknown>>(
    "./locales/he/**/*.generated.json",
    {
        eager: true,
        import: "default",
    },
);

function loadLocaleResources(locale: Language) {
    const files = locale === "en" ? englishLocaleFiles : hebrewLocaleFiles;

    return Object.entries(files).reduce<Record<string, Record<string, unknown>>>(
        (accumulator, [filePath, json]) => {
            const namespace = namespaceFromGeneratedPath(filePath, locale);
            accumulator[namespace] = json;
            return accumulator;
        },
        {},
    );
}

const resources = {
    en: loadLocaleResources("en"),
    he: loadLocaleResources("he"),
} as const;

function resolveDefaultNamespace() {
    const englishNamespaces = Object.keys(resources.en);

    if (englishNamespaces.length === 0) {
        return "translation";
    }

    const sortedNamespaces = [...englishNamespaces].sort((a, b) =>
        a.localeCompare(b),
    );

    return sortedNamespaces.at(0) ?? "translation";
}

const defaultNamespace = resolveDefaultNamespace();

export function getTranslationKey(resourceKey: string, key: string) {
    return `${getTranslationNamespace(resourceKey)}:${key}`;
}

function createTranslatedValue(
    namespace: string,
    value: unknown,
    pathSegments: Array<string | number>,
): unknown {
    if (typeof value === "string") {
        const keyPath = pathSegments.join(".");
        return i18n.t(`${namespace}:${keyPath}`, { defaultValue: value });
    }

    if (Array.isArray(value)) {
        return value.map((item, index) =>
            createTranslatedValue(namespace, item, [...pathSegments, index]),
        );
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    return new Proxy(value as Record<string, unknown>, {
        get(target, property) {
            if (typeof property !== "string") {
                return Reflect.get(target, property);
            }

            const nestedValue = target[property];
            return createTranslatedValue(namespace, nestedValue, [
                ...pathSegments,
                property,
            ]);
        },
    });
}

export function translatedResources<T extends object>(
    resourceKey: string,
    fallbackResources: T,
): T {
    const namespace = getTranslationNamespace(resourceKey);
    return createTranslatedValue(namespace, fallbackResources, []) as T;
}

let hasInitialized = false;

export function initializeI18n(language: Language) {
    if (hasInitialized) {
        if (i18n.language !== language) {
            void i18n.changeLanguage(language);
        }
        return i18n;
    }

    void i18n.use(initReactI18next).init({
        resources,
        lng: language,
        fallbackLng: "en",
        defaultNS: defaultNamespace,
        interpolation: {
            escapeValue: false,
        },
    });

    hasInitialized = true;

    return i18n;
}

export { i18n };
