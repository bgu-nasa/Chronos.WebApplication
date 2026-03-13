/**
 * Resource Attribute Assignment data repository
 * Handles resource attribute assignment API calls with organization context
 */

import type {
    ResourceAttributeAssignmentResponse,
    CreateResourceAttributeAssignmentRequest,
    UpdateResourceAttributeAssignmentRequest,
} from "@/modules/resources/src/data/resource-attribute-assignment.types";

/**
 * Resource Attribute Assignment repository class
 * Provides methods for CRUD operations on resource attribute assignments
 */
export class ResourceAttributeAssignmentDataRepository {
    /**
     * Get organization ID from the current organization context
     * @throws Error if no organization is loaded
     */
    private getOrganizationId(): string {
        const organization = $app.organization.getOrganization();
        if (!organization) {
            throw new Error("No organization context available");
        }
        return organization.id;
    }

    /**
     * Get headers with organization ID
     */
    private getHeaders() {
        return {
            "x-org-id": this.getOrganizationId(),
        };
    }

    /**
     * Build the base URL for resource attribute assignment endpoints
     */
    private getBaseUrl(): string {
        return `/api/resources/resource/attribute-assignments`;
    }

    /**
     * Fetch all resource attribute assignments for the organization
     * @returns Array of resource attribute assignments
     */
    async getAll(): Promise<ResourceAttributeAssignmentResponse[]> {
        $app.logger.info(
            "[ResourceAttributeAssignmentDataRepository] Fetching all assignments",
        );

        try {
            const response = await $app.ajax.get<
                ResourceAttributeAssignmentResponse[]
            >(this.getBaseUrl(), {
                headers: this.getHeaders(),
            });
            $app.logger.info(
                "[ResourceAttributeAssignmentDataRepository] Fetched assignments",
                { count: response.length },
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeAssignmentDataRepository] Error fetching assignments:",
                error,
            );
            throw error;
        }
    }

    /**
     * Fetch all resource attribute assignments for a specific resource
     * @param resourceId - The resource ID
     * @returns Array of resource attribute assignments filtered by resourceId
     */
    async getByResourceId(
        resourceId: string,
    ): Promise<ResourceAttributeAssignmentResponse[]> {
        $app.logger.info(
            "[ResourceAttributeAssignmentDataRepository] Fetching assignments for resource",
            { resourceId },
        );

        try {
            const allAssignments = await this.getAll();
            const filtered = allAssignments.filter(
                (assignment) => assignment.resourceId === resourceId,
            );
            $app.logger.info(
                "[ResourceAttributeAssignmentDataRepository] Filtered assignments",
                { count: filtered.length },
            );
            return filtered;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeAssignmentDataRepository] Error fetching assignments:",
                error,
            );
            throw error;
        }
    }

    /**
     * Create a new resource attribute assignment
     * @param request - The assignment creation request
     * @returns The created assignment
     */
    async create(
        request: CreateResourceAttributeAssignmentRequest,
    ): Promise<ResourceAttributeAssignmentResponse> {
        $app.logger.info(
            "[ResourceAttributeAssignmentDataRepository] Creating assignment",
            request,
        );

        try {
            const response =
                await $app.ajax.post<ResourceAttributeAssignmentResponse>(
                    this.getBaseUrl(),
                    request,
                    {
                        headers: this.getHeaders(),
                    },
                );
            $app.logger.info(
                "[ResourceAttributeAssignmentDataRepository] Created assignment",
                response,
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeAssignmentDataRepository] Error creating assignment:",
                error,
            );
            throw error;
        }
    }

    /**
     * Update an existing resource attribute assignment
     * @param resourceId - The resource ID
     * @param resourceAttributeId - The resource attribute ID
     * @param request - The assignment update request
     * @returns The updated assignment
     */
    async update(
        resourceId: string,
        resourceAttributeId: string,
        request: UpdateResourceAttributeAssignmentRequest,
    ): Promise<ResourceAttributeAssignmentResponse> {
        $app.logger.info(
            "[ResourceAttributeAssignmentDataRepository] Updating assignment",
            { resourceId, resourceAttributeId, ...request },
        );

        try {
            await $app.ajax.patch(
                `${this.getBaseUrl()}/${resourceId}/${resourceAttributeId}`,
                request,
                {
                    headers: this.getHeaders(),
                },
            );
            
            // Return the updated assignment (construct from request data)
            const response: ResourceAttributeAssignmentResponse = {
                resourceId: request.resourceId,
                resourceAttributeId: request.resourceAttributeId,
                organizationId: request.organizationId,
            };
            $app.logger.info(
                "[ResourceAttributeAssignmentDataRepository] Updated assignment",
                response,
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeAssignmentDataRepository] Error updating assignment:",
                error,
            );
            throw error;
        }
    }

    /**
     * Delete a resource attribute assignment
     * @param resourceId - The resource ID
     * @param resourceAttributeId - The resource attribute ID
     */
    async delete(
        resourceId: string,
        resourceAttributeId: string,
    ): Promise<void> {
        $app.logger.info(
            "[ResourceAttributeAssignmentDataRepository] Deleting assignment",
            { resourceId, resourceAttributeId },
        );

        try {
            await $app.ajax.delete(
                `${this.getBaseUrl()}/${resourceId}/${resourceAttributeId}`,
                {
                    headers: this.getHeaders(),
                },
            );
            $app.logger.info(
                "[ResourceAttributeAssignmentDataRepository] Deleted assignment",
                { resourceId, resourceAttributeId },
            );
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeAssignmentDataRepository] Error deleting assignment:",
                error,
            );
            throw error;
        }
    }
}

/**
 * Singleton instance of ResourceAttributeAssignmentDataRepository
 */
export const resourceAttributeAssignmentDataRepository =
    new ResourceAttributeAssignmentDataRepository();
