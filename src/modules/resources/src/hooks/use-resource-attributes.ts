/**
 * Resource Attribute hooks
 * React hooks for resource attribute CRUD operations using Zustand store
 */

import { useResourceAttributeStore } from "@/modules/resources/src/state";

/**
 * Hook for accessing resource attributes state and actions
 */
export function useResourceAttributes() {
    const resourceAttributes = useResourceAttributeStore((state) => state.resourceAttributes);
    const isLoading = useResourceAttributeStore((state) => state.isLoading);
    const error = useResourceAttributeStore((state) => state.error);
    const fetchResourceAttributes = useResourceAttributeStore((state) => state.fetchResourceAttributes);

    return {
        resourceAttributes,
        isLoading,
        error,
        fetchResourceAttributes,
    };
}

/**
 * Hook for creating a resource attribute
 */
export function useCreateResourceAttribute() {
    const createResourceAttribute = useResourceAttributeStore((state) => state.createResourceAttribute);
    const isLoading = useResourceAttributeStore((state) => state.isLoading);
    const error = useResourceAttributeStore((state) => state.error);

    return {
        createResourceAttribute,
        isLoading,
        error,
    };
}

/**
 * Hook for updating a resource attribute
 */
export function useUpdateResourceAttribute() {
    const updateResourceAttribute = useResourceAttributeStore((state) => state.updateResourceAttribute);
    const isLoading = useResourceAttributeStore((state) => state.isLoading);
    const error = useResourceAttributeStore((state) => state.error);

    return {
        updateResourceAttribute,
        isLoading,
        error,
    };
}

/**
 * Hook for deleting a resource attribute
 */
export function useDeleteResourceAttribute() {
    const deleteResourceAttribute = useResourceAttributeStore((state) => state.deleteResourceAttribute);
    const isLoading = useResourceAttributeStore((state) => state.isLoading);
    const error = useResourceAttributeStore((state) => state.error);

    return {
        deleteResourceAttribute,
        isLoading,
        error,
    };
}
