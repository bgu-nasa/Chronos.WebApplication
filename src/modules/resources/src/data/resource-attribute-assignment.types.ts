/**
 * Resource Attribute Assignment data types
 * Matches the backend ResourceAttributeAssignmentResponse, CreateResourceAttributeAssignmentRequest, and UpdateResourceAttributeAssignmentRequest contracts
 */

/**
 * Resource Attribute Assignment response contract from API
 */
export interface ResourceAttributeAssignmentResponse {
    resourceId: string; // Guid from C#
    resourceAttributeId: string; // Guid from C#
    organizationId: string; // Guid from C#
}

/**
 * Resource Attribute Assignment creation request contract for API
 */
export interface CreateResourceAttributeAssignmentRequest {
    organizationId: string; // Guid from C#
    resourceId: string; // Guid from C#
    resourceAttributeId: string; // Guid from C#
}

/**
 * Resource Attribute Assignment update request contract for API
 */
export interface UpdateResourceAttributeAssignmentRequest {
    organizationId: string; // Guid from C#
    resourceId: string; // Guid from C#
    resourceAttributeId: string; // Guid from C#
}
