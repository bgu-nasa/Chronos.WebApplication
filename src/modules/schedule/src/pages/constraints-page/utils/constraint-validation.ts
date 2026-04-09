/**
 * Validation utilities for constraint values
 */

export function getMinutesFromTime(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

/**
 * Validates forbidden_timerange format: "Weekday HH:mm - HH:mm"
 * Examples: "Monday 09:30 - 11:00", "Tuesday 13:00-15:00, Wednesday 10:00 - 12:00"
 */
export function validateForbiddenTimeRange(value: string): string | null {
    if (!value?.trim()) {
        return null; // Empty is allowed
    }

    const entries = value.split(/[,\n\r]/).map(e => e.trim()).filter(Boolean);
    const pattern = /^(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/i;

    for (const entry of entries) {
        const match = pattern.exec(entry);
        if (!match) {
            return "Invalid format. Expected: 'Weekday HH:mm - HH:mm' (e.g., 'Monday 09:30 - 11:00')";
        }

        const startTime = match[2];
        const endTime = match[3];

        // Validate time format
        const timePattern = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
        if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
            return "Invalid time format. Use HH:mm (24-hour format)";
        }

        // Parse times to check if start < end
        const startTotal = getMinutesFromTime(startTime);
        const endTotal = getMinutesFromTime(endTime);

        if (startTotal >= endTotal) {
            return "Start time must be before end time";
        }
    }

    return null;
}

/**
 * Validates preferred_weekdays format: comma-separated weekday names
 * Examples: "Monday,Wednesday,Friday", "Tuesday,Thursday"
 */
export function validatePreferredWeekdays(value: string): string | null {
    if (!value?.trim()) {
        return null; // Empty is allowed
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const entries = value.split(',').map(e => e.trim()).filter(Boolean);

    for (const entry of entries) {
        const normalized = entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        if (!weekdays.includes(normalized)) {
            return `Invalid weekday: '${entry}'. Valid weekdays: ${weekdays.join(', ')}`;
        }
    }

    return null;
}

/**
 * Validates required_capacity format: JSON with min and/or max
 * Examples: {"min": 30}, {"max": 50}, {"min": 20, "max": 50}
 */
export function validateRequiredCapacity(value: string): string | null {
    if (!value?.trim()) {
        return "Value is required";
    }

    try {
        const parsed = JSON.parse(value);

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return "Invalid format. Expected JSON object";
        }

        if (!parsed.min && !parsed.max) {
            return "At least one of 'min' or 'max' must be specified";
        }

        if (parsed.min !== undefined) {
            if (typeof parsed.min !== 'number' || parsed.min < 0 || !Number.isInteger(parsed.min)) {
                return "'min' must be a non-negative integer";
            }
        }

        if (parsed.max !== undefined) {
            if (typeof parsed.max !== 'number' || parsed.max < 0 || !Number.isInteger(parsed.max)) {
                return "'max' must be a non-negative integer";
            }
        }

        if (parsed.min !== undefined && parsed.max !== undefined && parsed.min > parsed.max) {
            return "'min' cannot be greater than 'max'";
        }

        return null;
    } catch {
        return "Invalid JSON format. Expected: {\"min\": number} or {\"max\": number} or {\"min\": number, \"max\": number}";
    }
}

/**
 * Validates location_preference format: comma-separated location names
 * Examples: "Building A,Building B", "Main Campus"
 */
export function validateLocationPreference(value: string): string | null {
    if (!value?.trim()) {
        return null; // Empty is allowed
    }

    const entries = value.split(',').map(e => e.trim()).filter(Boolean);

    if (entries.length === 0) {
        return "At least one location must be specified";
    }

    return null;
}

/**
 * Validates compatible_resource_types format: comma-separated resource type names
 * Examples: "Lecture Hall,Seminar Room", "Computer Lab"
 */
export function validateCompatibleResourceTypes(value: string): string | null {
    if (!value?.trim()) {
        return "At least one resource type must be specified";
    }

    const entries = value.split(',').map(e => e.trim()).filter(Boolean);

    if (entries.length === 0) {
        return "At least one resource type must be specified";
    }

    return null;
}

/**
 * Validates constraint value based on constraint key
 */
export function validateConstraintValue(key: string, value: string): string | null {
    switch (key) {
        case 'forbidden_timerange':
            return validateForbiddenTimeRange(value);
        case 'preferred_timerange':
            // Preferred timerange uses the same format as forbidden_timerange
            return validateForbiddenTimeRange(value);
        case 'preferred_weekdays':
            return validatePreferredWeekdays(value);
        case 'required_capacity':
            return validateRequiredCapacity(value);
        case 'location_preference':
            return validateLocationPreference(value);
        case 'compatible_resource_types':
            return validateCompatibleResourceTypes(value);
        default:
            return null; // Unknown key, let backend handle it
    }
}
