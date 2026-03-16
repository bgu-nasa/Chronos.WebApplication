/**
 * Resource Attribute Store
 * Zustand store for centralized resource attribute state management
 */

import { create } from "zustand";
import { resourceAttributeDataRepository } from "@/modules/resources/src/data";
import type {
    ResourceAttributeResponse,
    CreateResourceAttributeRequest,
    UpdateResourceAttributeRequest,
} from "@/modules/resources/src/data";

interface ResourceAttributeStore {
    // State
    resourceAttributes: ResourceAttributeResponse[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchResourceAttributes: () => Promise<void>;
    createResourceAttribute: (request: CreateResourceAttributeRequest) => Promise<ResourceAttributeResponse | null>;
    updateResourceAttribute: (resourceAttributeId: string, request: UpdateResourceAttributeRequest) => Promise<boolean>;
    deleteResourceAttribute: (resourceAttributeId: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useResourceAttributeStore = create<ResourceAttributeStore>((set, get) => ({
    // Initial state
    resourceAttributes: [],
    isLoading: false,
    error: null,

    // Fetch all resource attributes for current organization
    fetchResourceAttributes: async () => {
        $app.logger.info("[ResourceAttributeStore] fetchResourceAttributes called");
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeStore] Organization ID", { organizationId: org.id });
            
            const data = await resourceAttributeDataRepository.getAll(org.id);
            $app.logger.info("[ResourceAttributeStore] Fetched resource attributes", { count: data.length });
            set({ resourceAttributes: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch resource attributes";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeStore] Error fetching resource attributes", err);
        }
    },

    // Create a resource attribute and refetch
    createResourceAttribute: async (request: CreateResourceAttributeRequest) => {
        $app.logger.info("[ResourceAttributeStore] createResourceAttribute called", { request });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeStore] Organization ID", { organizationId: org.id });
            
            const newResourceAttribute = await resourceAttributeDataRepository.create(request);
            
            $app.logger.info("[ResourceAttributeStore] Resource attribute created successfully", { resourceAttributeId: newResourceAttribute.id });
            set({ isLoading: false });

            // Refetch to update the list
            $app.logger.info("[ResourceAttributeStore] Refetching resource attributes");
            await get().fetchResourceAttributes();

            return newResourceAttribute;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create resource attribute";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeStore] Error creating resource attribute", err);
            return null;
        }
    },

    // Update a resource attribute and refetch
    updateResourceAttribute: async (
        resourceAttributeId: string,
        request: UpdateResourceAttributeRequest
    ) => {
        $app.logger.info("[ResourceAttributeStore] updateResourceAttribute called", { resourceAttributeId, request });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeStore] Organization ID", { organizationId: org.id });
            
            await resourceAttributeDataRepository.update(
                resourceAttributeId,
                request
            );
            
            $app.logger.info("[ResourceAttributeStore] Resource attribute updated successfully", { resourceAttributeId });
            set({ isLoading: false });

            // Refetch to update the list
            $app.logger.info("[ResourceAttributeStore] Refetching resource attributes");
            await get().fetchResourceAttributes();

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update resource attribute";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeStore] Error updating resource attribute", err);
            return false;
        }
    },

    // Delete a resource attribute and refetch
    deleteResourceAttribute: async (resourceAttributeId: string) => {
        $app.logger.info("[ResourceAttributeStore] deleteResourceAttribute called", { resourceAttributeId });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeStore] Organization ID", { organizationId: org.id });
            
            await resourceAttributeDataRepository.delete(resourceAttributeId);
            
            $app.logger.info("[ResourceAttributeStore] Resource attribute deleted successfully", { resourceAttributeId });
            set({ isLoading: false });

            // Refetch to update the list
            $app.logger.info("[ResourceAttributeStore] Refetching resource attributes");
            await get().fetchResourceAttributes();

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete resource attribute";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeStore] Error deleting resource attribute", err);
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
