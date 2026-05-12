/**
 * Activity data types
 * Matches the backend ActivityResponse, CreateActivityRequest, and UpdateActivityRequest contracts
 */

/**
 * Activity response contract from API
 */
export interface ActivityResponse {
    id: string; // Guid from C#
    organizationId: string; // Guid from C#
    subjectId: string; // Guid from C#
    assignedUserId: string; // Guid from C#
    activityType: string;
    expectedStudents: number | null;
    duration: number;
}

/**
 * Activity creation request contract for API
 * Note: Backend generates the ID automatically
 */
export interface CreateActivityRequest {
    organizationId: string; // Guid from C#
    subjectId: string; // Guid from C#
    assignedUserId: string; // Guid from C#
    activityType: string;
    expectedStudents: number | null;
    duration: number;
}

/**
 * Activity update request contract for API
 * Note: ID is not included in update request
 */
export interface UpdateActivityRequest {
    organizationId: string; // Guid from C#
    subjectId: string; // Guid from C#
    assignedUserId: string; // Guid from C#
    activityType: string;
    expectedStudents: number | null;
    duration: number;
}
