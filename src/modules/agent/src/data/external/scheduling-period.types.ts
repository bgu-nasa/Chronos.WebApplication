/**
 * Minimal read-only type for displaying scheduling period information.
 * Avoids direct dependency on the schedule module.
 */
export interface SchedulingPeriod {
    id: string;
    name: string;
    fromDate: string;
    toDate: string;
}
