/**
 * Resource Attribute data types
 * Matches the backend ResourceAttributeResponse, CreateResourceAttributeRequest, and UpdateResourceAttributeRequest contracts
 */

/**
 * Resource Attribute response contract from API
 */
export interface ResourceAttributeResponse {
    id: string; // Guid from C#
    organizationId: string; // Guid from C#
    title: string;
    description: string | null;
}

/**
 * Resource Attribute creation request contract for API
 */
export interface CreateResourceAttributeRequest {
    id: string; // Guid from C#
    organizationId: string; // Guid from C#
    title: string;
    description: string | null;
}

/**
 * Resource Attribute update request contract for API
 * Note: ID and OrganizationId are not included in update request
 */
export interface UpdateResourceAttributeRequest {
    title: string;
    description: string | null;
}
