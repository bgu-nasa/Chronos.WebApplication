/**
 * Formatter utilities to convert constraint values for display
 * Converts UTC times to local timezone for display in tables
 */

import { parseForbiddenTimeRange } from "./constraint-value-parser";

/**
 * Formats a constraint value for display in tables
 * For time range constraints, converts UTC to local timezone
 * For other constraints, returns the value as-is
 * 
 * @param key - The constraint key (e.g., "forbidden_timerange")
 * @param value - The constraint value from database (in UTC for time ranges)
 * @returns Formatted value for display (in local timezone for time ranges)
 */
export function formatConstraintValueForDisplay(key: string, value: string, weekNum?: number | null): string {
    if (!value?.trim()) {
        return value || "";
    }

    // Handle time range constraints that need UTC to local conversion
    if (key === "forbidden_timerange" || key === "preferred_timerange") {
        // Parse UTC entries and convert to local timezone
        const localEntries = parseForbiddenTimeRange(value);
        const weekSuffix = weekNum === null || weekNum === undefined ? "" : ` [W${weekNum}]`;

        // Format for display (entries are already in local timezone, just format as string)
        return localEntries
            .filter(e => e.weekday && e.startTime && e.endTime)
            .map(e => `${e.weekday}${weekSuffix} ${e.startTime} - ${e.endTime}`)
            .join(", ");
    }

    // For other constraint types, return as-is
    return value;
}
