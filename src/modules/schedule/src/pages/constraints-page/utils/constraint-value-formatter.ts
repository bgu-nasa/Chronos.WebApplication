/**
 * Formatter utilities to convert constraint values for display
 * Converts UTC times to local timezone for display in tables
 */

import { parseForbiddenTimeRange } from "./constraint-value-parser";

interface SchedulingPeriodRange {
    fromDate: string;
    toDate: string;
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function createDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getIsoWeekNumber(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = (utcDate.getUTCDay() + 6) % 7;
    utcDate.setUTCDate(utcDate.getUTCDate() - dayNumber + 3);

    const firstThursday = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 4));
    const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

    return 1 + Math.round((utcDate.getTime() - firstThursday.getTime()) / 604800000);
}

export function normalizeWeekday(weekday: string) {
    if (!weekday) {
        return weekday;
    }

    return weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
}

export function getWeekdayFromDateKey(dateKey: string, weekdayOptions: string[] = weekdays) {
    if (!dateKey) {
        return "";
    }

    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return weekdayOptions[date.getDay()] || "";
}

export function getDateFromIsoWeek(
    year: number,
    weekNum: number,
    weekday: string,
    weekdayOptions: string[] = weekdays
) {
    const normalizedWeekday = normalizeWeekday(weekday);
    const weekdayIndex = weekdayOptions.indexOf(normalizedWeekday);
    if (weekdayIndex < 0) {
        return "";
    }

    const week1Thursday = new Date(Date.UTC(year, 0, 4));
    const week1ThursdayDayNumber = (week1Thursday.getUTCDay() + 6) % 7;
    week1Thursday.setUTCDate(week1Thursday.getUTCDate() - week1ThursdayDayNumber + 3);

    const isoWeekdayOffset = (weekdayIndex + 6) % 7;
    const date = new Date(week1Thursday);
    date.setUTCDate(week1Thursday.getUTCDate() + (weekNum - 1) * 7 + isoWeekdayOffset - 3);

    return createDateKey(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function findDateKeyForWeekdayInPeriod(
    schedulingPeriod: SchedulingPeriodRange,
    weekNum: number,
    weekday: string
) {
    const startDate = new Date(schedulingPeriod.fromDate);
    const endDate = new Date(schedulingPeriod.toDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
    }

    const targetWeekday = normalizeWeekday(weekday);
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    while (cursor <= endDate) {
        const cursorWeekday = weekdays[cursor.getDay()];
        if (cursorWeekday === targetWeekday && getIsoWeekNumber(createDateKey(cursor)) === weekNum) {
            return createDateKey(cursor);
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return null;
}

/**
 * Formats a constraint value for display in tables
 * For time range constraints, converts UTC to local timezone.
 * One-time forbidden time ranges are displayed as actual dates.
 * For other constraints, returns the value as-is.
 * 
 * @param key - The constraint key (e.g., "forbidden_timerange")
 * @param value - The constraint value from database (in UTC for time ranges)
 * @param weekNum - Optional ISO week number used for one-time forbidden time ranges
 * @param schedulingPeriod - Scheduling period boundaries used to resolve one-time dates
 * @returns Formatted value for display
 */
export function formatConstraintValueForDisplay(
    key: string,
    value: string,
    weekNum?: number | null,
    schedulingPeriod?: SchedulingPeriodRange
): string {
    if (!value?.trim()) {
        return value || "";
    }

    if (key === "forbidden_timerange" || key === "preferred_timerange") {
        const localEntries = parseForbiddenTimeRange(value);
        const canShowDate = key === "forbidden_timerange"
            && weekNum !== null
            && weekNum !== undefined
            && schedulingPeriod !== undefined;

        return localEntries
            .filter(entry => entry.weekday && entry.startTime && entry.endTime)
            .map(entry => {
                if (canShowDate) {
                    const dateKey = findDateKeyForWeekdayInPeriod(schedulingPeriod, weekNum, entry.weekday);
                    if (dateKey) {
                        return `${dateKey} ${entry.startTime} - ${entry.endTime}`;
                    }
                }

                return `${entry.weekday} ${entry.startTime} - ${entry.endTime}`;
            })
            .join(", ");
    }

    return value;
}
