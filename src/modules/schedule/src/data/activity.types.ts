/**
 * Activity Types for Schedule Module
 * Used for fetching activities, subjects, and users from APIs
 */

/**
 * Activity Response from API
 * GET /api/department/{departmentId}/resources/subjects/Subject/activities
 */
export interface ActivityResponse {
    id: string;
    organizationId: string;
    subjectId: string;
    assignedUserId: string;
    activityType: string;
    expectedStudents: number | null;
    duration: number;
}

/**
 * Subject Response from API
 * GET /api/department/{departmentId}/resources/subjects/Subject
 */
export interface SubjectResponse {
    id: string;
    organizationId: string;
    departmentId: string;
    schedulingPeriodId: string;
    code: string;
    name: string;
}

/**
 * User Response from API
 * GET /api/user
 */
export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    verified: boolean;
}

/**
 * Enriched Activity with subject name and user names
 * Used for display in dropdown
 */
export interface EnrichedActivity {
    id: string;
    activityType: string;
    subjectName: string;
    userFullName: string;
    displayLabel: string;
    duration: number;
}
