/**
 * Resource data types
 * Matches the backend ResourceResponse, CreateResourceRequest, and UpdateResourceRequest contracts
 */

/**
 * Resource response contract from API
 */
export interface ResourceResponse {
    id: string; // Guid from C#
    organizationId: string; // Guid from C#
    resourceTypeId: string; // Guid from C#
    location: string;
    identifier: string;
    capacity: number | null;
}

/**
 * Resource creation request contract for API
 * Note: Backend generates the ID automatically
 */
export interface CreateResourceRequest {
    organizationId: string; // Guid from C#
    resourceTypeId: string; // Guid from C#
    location: string;
    identifier: string;
    capacity: number | null;
}

/**
 * Resource update request contract for API
 * Note: ID is not included in update request
 */
export interface UpdateResourceRequest {
    resourceTypeId: string; // Guid from C#
    location: string;
    identifier: string;
    capacity: number | null;
}
