/**
 * Timezone utility functions for converting between UTC and local time
 * Handles weekday splits when timezone conversion causes day changes
 * 
 * IMPORTANT: Users always input times in their LOCAL timezone.
 * - When saving: Local time → Convert to UTC → Store in database
 * - When loading: Database (UTC) → Convert to local → Display to user
 */

export interface TimeRangeEntry {
    weekday: string;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
}

/**
 * Converts a local time range entry to UTC
 * May split into multiple entries if the time range crosses a day boundary in UTC
 */
export function convertLocalToUtc(entry: TimeRangeEntry): TimeRangeEntry[] {
    const { weekday, startTime, endTime } = entry;

    // Parse times
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Create a date object for the weekday in local timezone
    const weekdayIndex = getWeekdayIndex(weekday);
    const localDate = getDateForWeekday(weekdayIndex);
    localDate.setHours(startHours, startMinutes, 0, 0);

    // Calculate duration in milliseconds
    const durationMs = ((endHours - startHours) * 60 + (endMinutes - startMinutes)) * 60000;

    // Get UTC equivalent (Date objects are stored in UTC internally)
    const utcStartDate = new Date(localDate);
    const utcEndDate = new Date(localDate.getTime() + durationMs);

    // Get UTC weekday and time
    const utcStartWeekday = getWeekdayName(utcStartDate.getUTCDay());
    const utcEndWeekday = getWeekdayName(utcEndDate.getUTCDay());
    const utcStartTime = formatTime(utcStartDate.getUTCHours(), utcStartDate.getUTCMinutes());
    const utcEndTime = formatTime(utcEndDate.getUTCHours(), utcEndDate.getUTCMinutes());

    // If same weekday in UTC, return single entry
    if (utcStartWeekday === utcEndWeekday) {
        return [{
            weekday: utcStartWeekday,
            startTime: utcStartTime,
            endTime: utcEndTime,
        }];
    }

    // Split across two weekdays
    // First part: from start to end of start day
    const startDayEnd = new Date(utcStartDate);
    startDayEnd.setUTCHours(23, 59, 59, 999);
    const startDayEndTime = formatTime(23, 59);

    // Second part: from start of end day to end
    const endDayStart = new Date(utcEndDate);
    endDayStart.setUTCHours(0, 0, 0, 0);
    const endDayStartTime = formatTime(0, 0);

    return [
        {
            weekday: utcStartWeekday,
            startTime: utcStartTime,
            endTime: startDayEndTime,
        },
        {
            weekday: utcEndWeekday,
            startTime: endDayStartTime,
            endTime: utcEndTime,
        },
    ];
}

/**
 * Converts a UTC time range entry to local time
 * May split into multiple entries if the time range crosses a day boundary in local time
 */
export function convertUtcToLocal(entry: TimeRangeEntry): TimeRangeEntry[] {
    const { weekday, startTime, endTime } = entry;

    // Parse times
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Create a date object for the weekday in UTC
    const weekdayIndex = getWeekdayIndex(weekday);
    const utcDate = getDateForWeekday(weekdayIndex);
    utcDate.setUTCHours(startHours, startMinutes, 0, 0);

    // Calculate duration in milliseconds
    const durationMs = ((endHours - startHours) * 60 + (endMinutes - startMinutes)) * 60000;

    // Get local equivalent (Date objects convert automatically when using getHours/getDay)
    const localStartDate = new Date(utcDate);
    const localEndDate = new Date(utcDate.getTime() + durationMs);

    // Get local weekday and time
    const localStartWeekday = getWeekdayName(localStartDate.getDay());
    const localEndWeekday = getWeekdayName(localEndDate.getDay());
    const localStartTime = formatTime(localStartDate.getHours(), localStartDate.getMinutes());
    const localEndTime = formatTime(localEndDate.getHours(), localEndDate.getMinutes());

    // If same weekday in local time, return single entry
    if (localStartWeekday === localEndWeekday) {
        return [{
            weekday: localStartWeekday,
            startTime: localStartTime,
            endTime: localEndTime,
        }];
    }

    // Split across two weekdays
    // First part: from start to end of start day
    const startDayEnd = new Date(localStartDate);
    startDayEnd.setHours(23, 59, 59, 999);
    const startDayEndTime = formatTime(23, 59);

    // Second part: from start of end day to end
    const endDayStart = new Date(localEndDate);
    endDayStart.setHours(0, 0, 0, 0);
    const endDayStartTime = formatTime(0, 0);

    return [
        {
            weekday: localStartWeekday,
            startTime: localStartTime,
            endTime: startDayEndTime,
        },
        {
            weekday: localEndWeekday,
            startTime: endDayStartTime,
            endTime: localEndTime,
        },
    ];
}

/**
 * Converts multiple UTC entries to local time entries
 */
export function convertUtcEntriesToLocal(entries: TimeRangeEntry[]): TimeRangeEntry[] {
    const localEntries: TimeRangeEntry[] = [];
    for (const entry of entries) {
        localEntries.push(...convertUtcToLocal(entry));
    }
    return localEntries;
}

/**
 * Converts multiple local entries to UTC entries
 */
export function convertLocalEntriesToUtc(entries: TimeRangeEntry[]): TimeRangeEntry[] {
    const utcEntries: TimeRangeEntry[] = [];
    for (const entry of entries) {
        utcEntries.push(...convertLocalToUtc(entry));
    }
    return utcEntries;
}

/**
 * Helper: Get weekday index (0 = Sunday, 1 = Monday, etc.)
 */
function getWeekdayIndex(weekday: string): number {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const normalized = weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
    return weekdays.indexOf(normalized);
}

/**
 * Helper: Get weekday name from index
 */
function getWeekdayName(index: number): string {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[index];
}

/**
 * Helper: Get a date object for a specific weekday (this week)
 */
function getDateForWeekday(weekdayIndex: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = weekdayIndex - currentDay;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date;
}

/**
 * Helper: Format hours and minutes as HH:mm
 */
function formatTime(hours: number, minutes: number): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Slot timezone conversion utilities
 * Similar to constraint conversion but returns arrays since slots can split across days
 */

export interface SlotTimeEntry {
    weekday: string;
    fromTime: string; // HH:mm format
    toTime: string; // HH:mm format
}

/**
 * Converts a local slot time to UTC
 * May split into multiple entries if the time range crosses a day boundary in UTC
 * 
 * @param weekday - Local weekday (e.g., "Sunday")
 * @param fromTime - Local start time (e.g., "08:00")
 * @param toTime - Local end time (e.g., "09:00")
 * @returns Array of UTC slot entries (may be 1 or 2 entries if split across days)
 */
export function convertSlotLocalToUtc(weekday: string, fromTime: string, toTime: string): SlotTimeEntry[] {
    // Parse times
    const [startHours, startMinutes] = fromTime.split(':').map(Number);
    const [endHours, endMinutes] = toTime.split(':').map(Number);

    // Create a date object for the weekday in local timezone
    const weekdayIndex = getWeekdayIndex(weekday);
    const localDate = getDateForWeekday(weekdayIndex);
    localDate.setHours(startHours, startMinutes, 0, 0);

    // Calculate duration in milliseconds
    const durationMs = ((endHours - startHours) * 60 + (endMinutes - startMinutes)) * 60000;

    // Get UTC equivalent
    const utcStartDate = new Date(localDate);
    const utcEndDate = new Date(localDate.getTime() + durationMs);

    // Get UTC weekday and time
    const utcStartWeekday = getWeekdayName(utcStartDate.getUTCDay());
    const utcEndWeekday = getWeekdayName(utcEndDate.getUTCDay());
    const utcStartTime = formatTime(utcStartDate.getUTCHours(), utcStartDate.getUTCMinutes());
    const utcEndTime = formatTime(utcEndDate.getUTCHours(), utcEndDate.getUTCMinutes());

    // If same weekday in UTC, return single entry
    if (utcStartWeekday === utcEndWeekday) {
        return [{
            weekday: utcStartWeekday,
            fromTime: utcStartTime,
            toTime: utcEndTime,
        }];
    }

    // Split across two weekdays
    // First part: from start to end of start day
    const startDayEnd = new Date(utcStartDate);
    startDayEnd.setUTCHours(23, 59, 59, 999);
    const startDayEndTime = formatTime(23, 59);

    // Second part: from start of end day to end
    const endDayStart = new Date(utcEndDate);
    endDayStart.setUTCHours(0, 0, 0, 0);
    const endDayStartTime = formatTime(0, 0);

    return [
        {
            weekday: utcStartWeekday,
            fromTime: utcStartTime,
            toTime: startDayEndTime,
        },
        {
            weekday: utcEndWeekday,
            fromTime: endDayStartTime,
            toTime: utcEndTime,
        },
    ];
}

/**
 * Converts a UTC slot time to local time
 * May split into multiple entries if the time range crosses a day boundary in local time
 * 
 * @param weekday - UTC weekday (e.g., "Sunday")
 * @param fromTime - UTC start time (e.g., "06:00")
 * @param toTime - UTC end time (e.g., "07:00")
 * @returns Array of local slot entries (may be 1 or 2 entries if split across days)
 */
export function convertSlotUtcToLocal(weekday: string, fromTime: string, toTime: string): SlotTimeEntry[] {
    // Parse times
    const [startHours, startMinutes] = fromTime.split(':').map(Number);
    const [endHours, endMinutes] = toTime.split(':').map(Number);

    // Create a date object for the weekday in UTC
    const weekdayIndex = getWeekdayIndex(weekday);
    const utcDate = getDateForWeekday(weekdayIndex);
    utcDate.setUTCHours(startHours, startMinutes, 0, 0);

    // Calculate duration in milliseconds
    const durationMs = ((endHours - startHours) * 60 + (endMinutes - startMinutes)) * 60000;

    // Get local equivalent
    const localStartDate = new Date(utcDate);
    const localEndDate = new Date(utcDate.getTime() + durationMs);

    // Get local weekday and time
    const localStartWeekday = getWeekdayName(localStartDate.getDay());
    const localEndWeekday = getWeekdayName(localEndDate.getDay());
    const localStartTime = formatTime(localStartDate.getHours(), localStartDate.getMinutes());
    const localEndTime = formatTime(localEndDate.getHours(), localEndDate.getMinutes());

    // If same weekday in local time, return single entry
    if (localStartWeekday === localEndWeekday) {
        return [{
            weekday: localStartWeekday,
            fromTime: localStartTime,
            toTime: localEndTime,
        }];
    }

    // Split across two weekdays
    // First part: from start to end of start day
    const startDayEnd = new Date(localStartDate);
    startDayEnd.setHours(23, 59, 59, 999);
    const startDayEndTime = formatTime(23, 59);

    // Second part: from start of end day to end
    const endDayStart = new Date(localEndDate);
    endDayStart.setHours(0, 0, 0, 0);
    const endDayStartTime = formatTime(0, 0);

    return [
        {
            weekday: localStartWeekday,
            fromTime: localStartTime,
            toTime: startDayEndTime,
        },
        {
            weekday: localEndWeekday,
            fromTime: endDayStartTime,
            toTime: localEndTime,
        },
    ];
}
