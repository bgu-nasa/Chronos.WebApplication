/**
 * Resource Attribute Assignment Store
 * Zustand store for centralized resource attribute assignment state management
 */

import { create } from "zustand";
import { resourceAttributeAssignmentDataRepository } from "@/modules/resources/src/data";
import type {
    ResourceAttributeAssignmentResponse,
    CreateResourceAttributeAssignmentRequest,
    UpdateResourceAttributeAssignmentRequest,
} from "@/modules/resources/src/data";

interface ResourceAttributeAssignmentStore {
    // State
    resourceAttributeAssignments: ResourceAttributeAssignmentResponse[];
    isLoading: boolean;
    error: string | null;
    currentResourceId: string | null; // Track which resource's assignments are loaded

    // Actions
    fetchAssignmentsByResourceId: (resourceId: string) => Promise<void>;
    createAssignment: (request: CreateResourceAttributeAssignmentRequest) => Promise<ResourceAttributeAssignmentResponse | null>;
    updateAssignment: (
        resourceId: string,
        resourceAttributeId: string,
        request: UpdateResourceAttributeAssignmentRequest
    ) => Promise<boolean>;
    deleteAssignment: (resourceId: string, resourceAttributeId: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
    clearAssignments: () => void;
}

export const useResourceAttributeAssignmentStore = create<ResourceAttributeAssignmentStore>((set, get) => ({
    // Initial state
    resourceAttributeAssignments: [],
    isLoading: false,
    error: null,
    currentResourceId: null,

    // Fetch all assignments for a specific resource
    fetchAssignmentsByResourceId: async (resourceId: string) => {
        $app.logger.info("[ResourceAttributeAssignmentStore] fetchAssignmentsByResourceId called", { resourceId });
        set({ isLoading: true, error: null, currentResourceId: resourceId });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeAssignmentStore] Organization ID", { organizationId: org.id });
            
            const data = await resourceAttributeAssignmentDataRepository.getByResourceId(resourceId);
            $app.logger.info("[ResourceAttributeAssignmentStore] Fetched assignments", { count: data.length });
            set({ resourceAttributeAssignments: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch resource attribute assignments";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeAssignmentStore] Error fetching assignments", err);
        }
    },

    // Create an assignment and refetch
    createAssignment: async (request: CreateResourceAttributeAssignmentRequest) => {
        $app.logger.info("[ResourceAttributeAssignmentStore] createAssignment called", { request });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeAssignmentStore] Organization ID", { organizationId: org.id });
            
            const newAssignment = await resourceAttributeAssignmentDataRepository.create(request);
            
            $app.logger.info("[ResourceAttributeAssignmentStore] Assignment created successfully", newAssignment);
            set({ isLoading: false });

            // Refetch to update the list if we're viewing this resource's assignments
            const currentResourceId = get().currentResourceId;
            if (currentResourceId === request.resourceId) {
                $app.logger.info("[ResourceAttributeAssignmentStore] Refetching assignments");
                await get().fetchAssignmentsByResourceId(currentResourceId);
            }

            return newAssignment;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create assignment";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeAssignmentStore] Error creating assignment", err);
            return null;
        }
    },

    // Update an assignment and refetch
    updateAssignment: async (
        resourceId: string,
        resourceAttributeId: string,
        request: UpdateResourceAttributeAssignmentRequest
    ) => {
        $app.logger.info("[ResourceAttributeAssignmentStore] updateAssignment called", { 
            resourceId, 
            resourceAttributeId, 
            request 
        });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeAssignmentStore] Organization ID", { organizationId: org.id });
            
            await resourceAttributeAssignmentDataRepository.update(
                resourceId,
                resourceAttributeId,
                request
            );
            
            $app.logger.info("[ResourceAttributeAssignmentStore] Assignment updated successfully", { 
                resourceId, 
                resourceAttributeId 
            });
            set({ isLoading: false });

            // Refetch to update the list if we're viewing this resource's assignments
            const currentResourceId = get().currentResourceId;
            if (currentResourceId === resourceId) {
                $app.logger.info("[ResourceAttributeAssignmentStore] Refetching assignments");
                await get().fetchAssignmentsByResourceId(currentResourceId);
            }

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update assignment";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeAssignmentStore] Error updating assignment", err);
            return false;
        }
    },

    // Delete an assignment and refetch
    deleteAssignment: async (resourceId: string, resourceAttributeId: string) => {
        $app.logger.info("[ResourceAttributeAssignmentStore] deleteAssignment called", { 
            resourceId, 
            resourceAttributeId 
        });
        
        set({ isLoading: true, error: null });
        try {
            const org = $app.organization.getOrganization();
            if (!org) {
                throw new Error("No organization context found");
            }
            $app.logger.info("[ResourceAttributeAssignmentStore] Organization ID", { organizationId: org.id });
            
            await resourceAttributeAssignmentDataRepository.delete(resourceId, resourceAttributeId);
            
            $app.logger.info("[ResourceAttributeAssignmentStore] Assignment deleted successfully", { 
                resourceId, 
                resourceAttributeId 
            });
            set({ isLoading: false });

            // Refetch to update the list if we're viewing this resource's assignments
            const currentResourceId = get().currentResourceId;
            if (currentResourceId === resourceId) {
                $app.logger.info("[ResourceAttributeAssignmentStore] Refetching assignments");
                await get().fetchAssignmentsByResourceId(currentResourceId);
            }

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete assignment";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ResourceAttributeAssignmentStore] Error deleting assignment", err);
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    clearAssignments: () => set({ resourceAttributeAssignments: [], currentResourceId: null }),
}));
