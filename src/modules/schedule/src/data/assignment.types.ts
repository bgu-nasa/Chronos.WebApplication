/**
 * Assignment Types
 * Definitions for Assignment API responses and requests
 */

/**
 * Assignment Response Interface
 */
export interface AssignmentResponse {
    id: string;
    organizationId: string;
    slotId: string;
    resourceId: string;
    activityId: string;
    weekNum?: number | null;
}

/**
 * Create Assignment Request Interface
 */
export interface CreateAssignmentRequest {
    slotId: string;
    resourceId: string;
    activityId: string;
    weekNum?: number | null;
}

/**
 * Update Assignment Request Interface
 */
export interface UpdateAssignmentRequest {
    slotId?: string;
    resourceId?: string;
    activityId?: string;
    weekNum?: number | null;
}
