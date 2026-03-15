/**
 * Resource Attribute data repository
 * Handles resource attribute API calls with organization context
 */

import type {
    ResourceAttributeResponse,
    CreateResourceAttributeRequest,
    UpdateResourceAttributeRequest,
} from "@/modules/resources/src/data/resource-attribute.types";

/**
 * Resource Attribute repository class
 * Provides methods for CRUD operations on resource attributes
 */
export class ResourceAttributeDataRepository {
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
     * Build the base URL for resource attribute endpoints
     */
    private getBaseUrl(): string {
        return `/api/resources/resource/attributes`;
    }

    /**
     * Fetch all resource attributes for the current organization
     * @param organizationId - The organization ID
     * @returns Array of resource attributes
     */
    async getAll(organizationId: string): Promise<ResourceAttributeResponse[]> {
        $app.logger.info(
            "[ResourceAttributeDataRepository] Fetching all resource attributes",
            { organizationId },
        );

        try {
            const response = await $app.ajax.get<ResourceAttributeResponse[]>(
                `${this.getBaseUrl()}`,
                {
                    headers: this.getHeaders(),
                },
            );
            $app.logger.info(
                "[ResourceAttributeDataRepository] Fetched resource attributes",
                { count: response.length },
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeDataRepository] Error fetching resource attributes:",
                error,
            );
            throw error;
        }
    }

    /**
     * Fetch a specific resource attribute by ID
     * @param id - The resource attribute ID
     * @returns The resource attribute
     */
    async getById(id: string): Promise<ResourceAttributeResponse> {
        $app.logger.info(
            "[ResourceAttributeDataRepository] Fetching resource attribute by ID",
            { id },
        );

        try {
            const response = await $app.ajax.get<ResourceAttributeResponse>(
                `${this.getBaseUrl()}/${id}`,
                {
                    headers: this.getHeaders(),
                },
            );
            $app.logger.info(
                "[ResourceAttributeDataRepository] Fetched resource attribute",
                { id },
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeDataRepository] Error fetching resource attribute:",
                error,
            );
            throw error;
        }
    }

    /**
     * Create a new resource attribute
     * @param request - The resource attribute creation request
     * @returns The created resource attribute
     */
    async create(
        request: CreateResourceAttributeRequest,
    ): Promise<ResourceAttributeResponse> {
        $app.logger.info(
            "[ResourceAttributeDataRepository] Creating resource attribute",
            request,
        );

        try {
            const response = await $app.ajax.post<ResourceAttributeResponse>(
                this.getBaseUrl(),
                request,
                {
                    headers: this.getHeaders(),
                },
            );
            $app.logger.info(
                "[ResourceAttributeDataRepository] Created resource attribute",
                { id: response.id },
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeDataRepository] Error creating resource attribute:",
                error,
            );
            throw error;
        }
    }

    /**
     * Update an existing resource attribute
     * @param id - The resource attribute ID
     * @param request - The resource attribute update request
     * @returns The updated resource attribute
     */
    async update(
        id: string,
        request: UpdateResourceAttributeRequest,
    ): Promise<ResourceAttributeResponse> {
        $app.logger.info(
            "[ResourceAttributeDataRepository] Updating resource attribute",
            { id, ...request },
        );

        try {
            await $app.ajax.patch(
                `${this.getBaseUrl()}/${id}`,
                request,
                {
                    headers: this.getHeaders(),
                },
            );
            
            // Return the updated resource attribute by fetching it
            const response = await this.getById(id);
            $app.logger.info(
                "[ResourceAttributeDataRepository] Updated resource attribute",
                { id },
            );
            return response;
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeDataRepository] Error updating resource attribute:",
                error,
            );
            throw error;
        }
    }

    /**
     * Delete a resource attribute
     * @param id - The resource attribute ID
     */
    async delete(id: string): Promise<void> {
        $app.logger.info(
            "[ResourceAttributeDataRepository] Deleting resource attribute",
            { id },
        );

        try {
            await $app.ajax.delete(`${this.getBaseUrl()}/${id}`, {
                headers: this.getHeaders(),
            });
            $app.logger.info(
                "[ResourceAttributeDataRepository] Deleted resource attribute",
                { id },
            );
        } catch (error) {
            $app.logger.error(
                "[ResourceAttributeDataRepository] Error deleting resource attribute:",
                error,
            );
            throw error;
        }
    }
}

/**
 * Singleton instance of ResourceAttributeDataRepository
 */
export const resourceAttributeDataRepository = new ResourceAttributeDataRepository();
