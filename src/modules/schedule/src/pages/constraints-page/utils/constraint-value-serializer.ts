/**
 * Serializer utilities to convert form data structures into backend-expected format
 */

import type { ForbiddenTimeRangeEntry, RequiredCapacityFormData } from "./constraint-value-parser";
import { convertLocalEntriesToUtc, type TimeRangeEntry } from "./timezone-utils";

/**
 * Serializes forbidden_timerange form entries into backend format
 * 
 * IMPORTANT: Users input times in their LOCAL timezone.
 * This function converts local time to UTC before saving to the database.
 * 
 * Input: [{ weekday: "Monday", startTime: "09:30", endTime: "11:00" }] (in user's local timezone)
 * Output: "Monday 09:30 - 11:00" (in UTC, may be split across multiple entries if timezone conversion causes day change)
 */
export function serializeForbiddenTimeRange(entries: ForbiddenTimeRangeEntry[]): string {
    // Filter valid entries
    const validEntries = entries.filter(e => e.weekday && e.startTime && e.endTime);

    // Convert local entries to UTC (may split across weekdays)
    const utcEntries = convertLocalEntriesToUtc(validEntries as TimeRangeEntry[]);

    // Serialize UTC entries to backend format
    return utcEntries
        .map(e => `${e.weekday} ${e.startTime} - ${e.endTime}`)
        .join(", ");
}

/**
 * Serializes preferred_timerange form entries into backend format
 * 
 * IMPORTANT: Users input times in their LOCAL timezone.
 * This function converts local time to UTC before saving to the database.
 * 
 * Input: [{ weekday: "Monday", startTime: "09:30", endTime: "11:00" }] (in user's local timezone)
 * Output: "Monday 09:30 - 11:00" (in UTC, may be split across multiple entries if timezone conversion causes day change)
 * 
 * Note: Uses the same serialization logic as forbidden_timerange since the format is identical
 */
export function serializePreferredTimeRange(entries: ForbiddenTimeRangeEntry[]): string {
    // Reuse the same serialization logic as forbidden_timerange
    return serializeForbiddenTimeRange(entries);
}

/**
 * Serializes preferred_weekdays array into backend format
 * Input: ["Monday", "Wednesday", "Friday"]
 * Output: "Monday,Wednesday,Friday"
 */
export function serializePreferredWeekdays(weekdays: string[]): string {
    return weekdays.filter(Boolean).join(",");
}

/**
 * Serializes required_capacity form data into JSON string
 * Input: { min: 30, max: 50 }
 * Output: '{"min":30,"max":50}'
 */
export function serializeRequiredCapacity(data: RequiredCapacityFormData): string {
    const obj: Record<string, number> = {};
    if (data.min !== undefined && data.min !== null) {
        obj.min = data.min;
    }
    if (data.max !== undefined && data.max !== null) {
        obj.max = data.max;
    }
    return JSON.stringify(obj);
}

/**
 * Serializes array into comma-separated string
 * Input: ["Building A", "Building B"]
 * Output: "Building A,Building B"
 */
export function serializeCommaSeparated(values: string[]): string {
    return values.filter(Boolean).join(",");
}
