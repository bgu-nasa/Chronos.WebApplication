/**
 * Subject data types
 * Matches the backend SubjectResponse, CreateSubjectRequest, and UpdateSubjectRequest contracts
 */

/**
 * Subject response contract from API
 */
export interface SubjectResponse {
    id: string; // Guid from C#
    organizationId: string; // Guid from C#
    departmentId: string; // Guid from C#
    schedulingPeriodId: string; // Guid from C#
    code: string;
    name: string;
}

/**
 * Subject creation request contract for API
 * Note: Backend generates the ID automatically
 */
export interface CreateSubjectRequest {
    organizationId: string; // Guid from C#
    departmentId: string; // Guid from C#
    schedulingPeriodId: string; // Guid from C#
    code: string;
    name: string;
}

/**
 * Subject update request contract for API
 * Note: id is passed in URL, not in the body
 */
export interface UpdateSubjectRequest {
    organizationId: string; // Guid from C#
    departmentId: string; // Guid from C#
    schedulingPeriodId: string; // Guid from C#
    code: string;
    name: string;
}
