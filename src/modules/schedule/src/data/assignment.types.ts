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
    weekNum: number;
}

/**
 * Create Assignment Request Interface
 */
export interface CreateAssignmentRequest {
    slotId: string;
    resourceId: string;
    activityId: string;
    weekNum: number;
}

/**
 * Update Assignment Request Interface
 */
export interface UpdateAssignmentRequest {
    slotId?: string;
    resourceId?: string;
    activityId?: string;
    weekNum?: number;
}
