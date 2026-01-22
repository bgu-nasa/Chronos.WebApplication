/**
 * Resource Attribute Assignment hooks
 * React hooks for resource attribute assignment CRUD operations using Zustand store
 */

import { useResourceAttributeAssignmentStore } from "@/modules/resources/src/state";

/**
 * Hook for accessing resource attribute assignments state and actions
 */
export function useResourceAttributeAssignments() {
    const resourceAttributeAssignments = useResourceAttributeAssignmentStore((state) => state.resourceAttributeAssignments);
    const isLoading = useResourceAttributeAssignmentStore((state) => state.isLoading);
    const error = useResourceAttributeAssignmentStore((state) => state.error);
    const currentResourceId = useResourceAttributeAssignmentStore((state) => state.currentResourceId);
    const fetchAssignmentsByResourceId = useResourceAttributeAssignmentStore((state) => state.fetchAssignmentsByResourceId);
    const clearAssignments = useResourceAttributeAssignmentStore((state) => state.clearAssignments);

    return {
        resourceAttributeAssignments,
        isLoading,
        error,
        currentResourceId,
        fetchAssignmentsByResourceId,
        clearAssignments,
    };
}

/**
 * Hook for creating a resource attribute assignment
 */
export function useCreateResourceAttributeAssignment() {
    const createAssignment = useResourceAttributeAssignmentStore((state) => state.createAssignment);
    const isLoading = useResourceAttributeAssignmentStore((state) => state.isLoading);
    const error = useResourceAttributeAssignmentStore((state) => state.error);

    return {
        createAssignment,
        isLoading,
        error,
    };
}

/**
 * Hook for updating a resource attribute assignment
 */
export function useUpdateResourceAttributeAssignment() {
    const updateAssignment = useResourceAttributeAssignmentStore((state) => state.updateAssignment);
    const isLoading = useResourceAttributeAssignmentStore((state) => state.isLoading);
    const error = useResourceAttributeAssignmentStore((state) => state.error);

    return {
        updateAssignment,
        isLoading,
        error,
    };
}

/**
 * Hook for deleting a resource attribute assignment
 */
export function useDeleteResourceAttributeAssignment() {
    const deleteAssignment = useResourceAttributeAssignmentStore((state) => state.deleteAssignment);
    const isLoading = useResourceAttributeAssignmentStore((state) => state.isLoading);
    const error = useResourceAttributeAssignmentStore((state) => state.error);

    return {
        deleteAssignment,
        isLoading,
        error,
    };
}
