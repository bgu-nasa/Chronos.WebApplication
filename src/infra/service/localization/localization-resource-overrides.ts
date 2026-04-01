import type { SupportedLocale } from "./localization.types";

type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

type JsonObject = { [key: string]: JsonValue };

const resourceModules = import.meta.glob<JsonObject>(
    "/src/**/*.resources.json",
    {
        eager: true,
        import: "default",
    }
);

const hebrewModules = import.meta.glob<JsonObject>(
    "/src/**/*.resources.he.json",
    {
        eager: true,
        import: "default",
    },
);

const baseResourceObjects: Record<string, JsonObject> = Object.fromEntries(
    Object.entries(resourceModules).filter(
        ([path]) => !path.endsWith(".resources.he.json"),
    ),
);

const baseResourceSnapshots: Record<string, JsonObject> = Object.fromEntries(
    Object.entries(baseResourceObjects).map(([path, value]) => [
        path,
        deepClone(value),
    ]),
);

function deepClone<T extends JsonValue>(value: T): T {
    return structuredClone(value);
}

function isPlainObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clearObject(target: JsonObject): void {
    Object.keys(target).forEach((key) => {
        delete target[key];
    });
}

function resetObjectInPlace(target: JsonObject, source: JsonObject): void {
    clearObject(target);
    Object.assign(target, deepClone(source));
}

function deepMerge(target: JsonObject, source: JsonObject): void {
    Object.entries(source).forEach(([key, sourceValue]) => {
        const targetValue = target[key];

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            deepMerge(targetValue, sourceValue);
            return;
        }

        target[key] = deepClone(sourceValue);
    });
}

export function applyLocalizedResourceLocale(locale: SupportedLocale): void {
    Object.entries(baseResourceObjects).forEach(([basePath, liveObject]) => {
        const baseSnapshot = baseResourceSnapshots[basePath];
        if (!baseSnapshot) {
            return;
        }

        resetObjectInPlace(liveObject, baseSnapshot);

        if (locale !== "he") {
            return;
        }

        const hebrewPath = basePath.replace(
            ".resources.json",
            ".resources.he.json",
        );
        const hebrewOverride = hebrewModules[hebrewPath];

        if (hebrewOverride) {
            deepMerge(liveObject, hebrewOverride);
        }
    });
}
