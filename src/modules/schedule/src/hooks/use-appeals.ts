import { useAppealStore } from "@/modules/schedule/src/state/appeal.store";

export function useAppeals() {
    const appeals = useAppealStore((state) => state.appeals);
    const isLoading = useAppealStore((state) => state.isLoading);
    const error = useAppealStore((state) => state.error);
    const fetchAppeals = useAppealStore((state) => state.fetchAppeals);
    const fetchAppealsByAssignment = useAppealStore((state) => state.fetchAppealsByAssignment);
    const clearAppeals = useAppealStore((state) => state.clearAppeals);

    return {
        appeals,
        isLoading,
        error,
        fetchAppeals,
        fetchAppealsByAssignment,
        clearAppeals,
    };
}

export function useCreateAppeal() {
    const createAppeal = useAppealStore((state) => state.createAppeal);
    const isLoading = useAppealStore((state) => state.isLoading);
    const error = useAppealStore((state) => state.error);
    const clearError = useAppealStore((state) => state.clearError);

    return {
        createAppeal,
        isLoading,
        error,
        clearError,
    };
}

export function useUpdateAppeal() {
    const updateAppeal = useAppealStore((state) => state.updateAppeal);
    const isLoading = useAppealStore((state) => state.isLoading);
    const error = useAppealStore((state) => state.error);
    const clearError = useAppealStore((state) => state.clearError);

    return {
        updateAppeal,
        isLoading,
        error,
        clearError,
    };
}

export function useDeleteAppeal() {
    const deleteAppeal = useAppealStore((state) => state.deleteAppeal);
    const isLoading = useAppealStore((state) => state.isLoading);
    const error = useAppealStore((state) => state.error);

    return {
        deleteAppeal,
        isLoading,
        error,
    };
}
