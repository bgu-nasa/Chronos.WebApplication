export interface SchedulingCompletedPayload {
    requestId: string;
    success: boolean;
    assignmentsCreated: number;
    assignmentsModified: number;
    unscheduledActivityIds: string[];
    failureReason: string | null;
}
