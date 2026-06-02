import { Weekday, WeekdayOrder } from "@/modules/schedule/src/data/slot.types";
import { translatedResources } from "@/infra/i18n";
import resourcesJson from "./weekdays.resources.json";

const resources = translatedResources(
    "src/common/weekdays/weekdays.resources.json",
    resourcesJson,
);

export { Weekday, WeekdayOrder };

/** English weekday names in Sunday-first order (for API / matching). */
export const ENGLISH_WEEKDAY_ORDER = [...WeekdayOrder] as const;

function normalizeWeekdayKey(weekday: string): string {
    if (!weekday) {
        return weekday;
    }

    return weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
}

/** Translated full weekday label; `weekday` must be English (e.g. "Monday"). */
export function getWeekdayLabel(weekday: string): string {
    const key = normalizeWeekdayKey(weekday);
    const labels = resources.labels as Record<string, string>;
    return labels[key] ?? weekday;
}

/** Translated short weekday label; `weekday` must be English. */
export function getWeekdayShortLabel(weekday: string): string {
    const key = normalizeWeekdayKey(weekday);
    const labels = resources.shortLabels as Record<string, string>;
    return labels[key] ?? weekday;
}

/** English weekday name for a date (locale-independent; use for backend matching). */
export function getEnglishWeekdayName(date: Date): string {
    return WeekdayOrder[date.getDay()];
}

/** Translated weekday label from a date. */
export function getWeekdayLabelFromDate(
    date: Date,
    style: "long" | "short" = "long",
): string {
    const english = getEnglishWeekdayName(date);
    return style === "short"
        ? getWeekdayShortLabel(english)
        : getWeekdayLabel(english);
}

/** Mantine Select data: English values, translated labels. */
export function getWeekdaySelectOptions(): Array<{ value: string; label: string }> {
    return WeekdayOrder.map((day) => ({
        value: day,
        label: getWeekdayLabel(day),
    }));
}

export function weekdayNamesMatch(a: string, b: string): boolean {
    return normalizeWeekdayKey(a) === normalizeWeekdayKey(b);
}

/** Comma-separated English weekday list → translated display. */
export function formatPreferredWeekdaysDisplay(value: string): string {
    if (!value?.trim()) {
        return value || "";
    }

    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => getWeekdayLabel(entry))
        .join(", ");
}
