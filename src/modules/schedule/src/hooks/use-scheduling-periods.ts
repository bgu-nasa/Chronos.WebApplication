/**
 * Scheduling Period hooks
 * React hooks for scheduling period CRUD operations using Zustand store
 */

import { useSchedulingPeriodStore } from "@/modules/schedule/src/state/scheduling-period.store";

/**
 * Hook for accessing scheduling periods state and actions
 */
export function useSchedulingPeriods() {
    const schedulingPeriods = useSchedulingPeriodStore((state) => state.schedulingPeriods);
    const isLoading = useSchedulingPeriodStore((state) => state.isLoading);
    const error = useSchedulingPeriodStore((state) => state.error);
    const fetchSchedulingPeriods = useSchedulingPeriodStore(
        (state) => state.fetchSchedulingPeriods
    );

    return {
        schedulingPeriods,
        isLoading,
        error,
        fetchSchedulingPeriods,
    };
}



/**
 * Hook for accessing only unfinished scheduling periods (toDate > now)
 */
export function useUnfinishedSchedulingPeriods() {
    const unfinishedSchedulingPeriods = useSchedulingPeriodStore((state) => state.unfinishedSchedulingPeriods);
    const isLoading = useSchedulingPeriodStore((state) => state.isLoading);
    const error = useSchedulingPeriodStore((state) => state.error);
    const fetchUnfinishedSchedulingPeriods = useSchedulingPeriodStore(
        (state) => state.fetchUnfinishedSchedulingPeriods
    );

    return {
        unfinishedSchedulingPeriods,
        isLoading,
        error,
        fetchUnfinishedSchedulingPeriods,
    };
}

/**
 * Hook for creating a scheduling period
 */
export function useCreateSchedulingPeriod() {
    const createSchedulingPeriod = useSchedulingPeriodStore(
        (state) => state.createSchedulingPeriod
    );
    const isLoading = useSchedulingPeriodStore((state) => state.isLoading);
    const error = useSchedulingPeriodStore((state) => state.error);
    const clearError = useSchedulingPeriodStore((state) => state.clearError);

    return {
        createSchedulingPeriod,
        isLoading,
        error,
        clearError,
    };
}

/**
 * Hook for updating a scheduling period
 */
export function useUpdateSchedulingPeriod() {
    const updateSchedulingPeriod = useSchedulingPeriodStore(
        (state) => state.updateSchedulingPeriod
    );
    const isLoading = useSchedulingPeriodStore((state) => state.isLoading);
    const error = useSchedulingPeriodStore((state) => state.error);
    const clearError = useSchedulingPeriodStore((state) => state.clearError);

    return {
        updateSchedulingPeriod,
        isLoading,
        error,
        clearError,
    };
}

/**
 * Hook for deleting a scheduling period
 */
export function useDeleteSchedulingPeriod() {
    const deleteSchedulingPeriod = useSchedulingPeriodStore(
        (state) => state.deleteSchedulingPeriod
    );
    const isLoading = useSchedulingPeriodStore((state) => state.isLoading);
    const error = useSchedulingPeriodStore((state) => state.error);

    return {
        deleteSchedulingPeriod,
        isLoading,
        error,
    };
}
