/**
 * Parser utilities to convert backend constraint values into form data structures
 */

import { convertUtcEntriesToLocal, type TimeRangeEntry } from "./timezone-utils";

export interface ForbiddenTimeRangeEntry {
    weekday: string;
    startTime: string;
    endTime: string;
}

export interface RequiredCapacityFormData {
    min?: number;
    max?: number;
}

/**
 * Parses forbidden_timerange value into form entries
 * 
 * IMPORTANT: Database stores times in UTC.
 * This function converts UTC to the user's LOCAL timezone for display.
 * 
 * Input: "Monday 09:30 - 11:00, Tuesday 13:00 - 15:00" (in UTC from database)
 * Output: Array of { weekday, startTime, endTime } (in user's local timezone for UI display)
 */
export function parseForbiddenTimeRange(value: string): ForbiddenTimeRangeEntry[] {
    if (!value?.trim()) {
        return [];
    }

    const utcEntries: TimeRangeEntry[] = [];
    const parts = value.split(/[,\n\r]/).map(p => p.trim()).filter(Boolean);
    const pattern = /^(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/i;

    for (const part of parts) {
        const match = pattern.exec(part);
        if (match) {
            const weekday = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            utcEntries.push({
                weekday,
                startTime: match[2],
                endTime: match[3],
            });
        }
    }

    // Convert UTC entries to local timezone (may split across weekdays)
    let localEntries = convertUtcEntriesToLocal(utcEntries);
    
    // Merge consecutive ranges that can be merged (any consecutive ranges, not just full days)
    localEntries = mergeConsecutiveRanges(localEntries);
    
    return localEntries;
}

/**
 * Merges consecutive time ranges on the same weekday
 * This handles cases where timezone conversion splits a range into multiple parts
 * Merges any consecutive ranges (where one range's end time is exactly 1 minute before the next range's start time)
 */
function mergeConsecutiveRanges(entries: ForbiddenTimeRangeEntry[]): ForbiddenTimeRangeEntry[] {
    if (entries.length <= 1) {
        return entries;
    }

    // Sort all entries by weekday and start time
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sorted = [...entries].sort((a, b) => {
        const aWeekdayIndex = weekdays.indexOf(a.weekday);
        const bWeekdayIndex = weekdays.indexOf(b.weekday);
        if (aWeekdayIndex !== bWeekdayIndex) {
            return aWeekdayIndex - bWeekdayIndex;
        }
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });

    const merged: ForbiddenTimeRangeEntry[] = [];
    let i = 0;

    while (i < sorted.length) {
        const current = sorted[i];
        let mergedRange: ForbiddenTimeRangeEntry = { ...current };
        let j = i;

        // Look for consecutive ranges on the same weekday
        while (j + 1 < sorted.length) {
            const next = sorted[j + 1];
            
            // Only merge if on the same weekday
            if (next.weekday !== mergedRange.weekday) {
                break;
            }
            
            const [lastEndHours, lastEndMinutes] = mergedRange.endTime.split(':').map(Number);
            const [nextStartHours, nextStartMinutes] = next.startTime.split(':').map(Number);
            
            const lastEndMinutesTotal = lastEndHours * 60 + lastEndMinutes;
            const nextStartMinutesTotal = nextStartHours * 60 + nextStartMinutes;
            
            // Check if consecutive (next start is exactly 1 minute after current end)
            const isConsecutiveTime = nextStartMinutesTotal === lastEndMinutesTotal + 1;
            
            if (isConsecutiveTime) {
                // Merge: extend the end time to the next range's end time
                mergedRange = {
                    weekday: mergedRange.weekday,
                    startTime: mergedRange.startTime,
                    endTime: next.endTime,
                };
                j++;
            } else {
                // Not consecutive, stop merging
                break;
            }
        }

        // Add the merged range (or single range if no merging occurred)
        merged.push(mergedRange);
        i = j + 1;
    }

    return merged;
}

/**
 * Parses preferred_timerange value into form entries
 * 
 * IMPORTANT: Database stores times in UTC.
 * This function converts UTC to the user's LOCAL timezone for display.
 * 
 * Input: "Monday 09:30 - 11:00, Tuesday 13:00 - 15:00" (in UTC from database)
 * Output: Array of { weekday, startTime, endTime } (in user's local timezone for UI display)
 * 
 * Note: Uses the same parsing logic as forbidden_timerange since the format is identical
 */
export function parsePreferredTimeRange(value: string): ForbiddenTimeRangeEntry[] {
    // Reuse the same parsing logic as forbidden_timerange
    return parseForbiddenTimeRange(value);
}

/**
 * Parses preferred_weekdays value into array of weekday strings
 * Input: "Monday,Wednesday,Friday"
 * Output: ["Monday", "Wednesday", "Friday"]
 */
export function parsePreferredWeekdays(value: string): string[] {
    if (!value?.trim()) {
        return [];
    }

    const weekdays = new Set(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    const entries = value.split(',').map(e => e.trim()).filter(Boolean);

    return entries.map(entry => {
        const normalized = entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return weekdays.has(normalized) ? normalized : entry;
    });
}

/**
 * Parses required_capacity JSON value into form data
 * Input: '{"min": 30, "max": 50}'
 * Output: { min: 30, max: 50 }
 */
export function parseRequiredCapacity(value: string): RequiredCapacityFormData {
    if (!value?.trim()) {
        return {};
    }

    try {
        const parsed = JSON.parse(value);
        return {
            min: parsed.min === undefined ? undefined : Number(parsed.min),
            max: parsed.max === undefined ? undefined : Number(parsed.max),
        };
    } catch {
        return {};
    }
}

/**
 * Parses comma-separated string into array
 * Input: "Building A,Building B"
 * Output: ["Building A", "Building B"]
 */
export function parseCommaSeparated(value: string): string[] {
    if (!value?.trim()) {
        return [];
    }

    return value.split(',').map(e => e.trim()).filter(Boolean);
}
