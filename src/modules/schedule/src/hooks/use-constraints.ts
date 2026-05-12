/**
 * Custom hooks for constraint management
 * Wraps the constraint store for easier component consumption
 */

import { useConstraintStore } from "@/modules/schedule/src/state/constraints.store";

/**
 * Hook for user constraints management
 */
export function useUserConstraints() {
    const userConstraints = useConstraintStore((state) => state.userConstraints);
    const isLoading = useConstraintStore((state) => state.isLoading);
    const error = useConstraintStore((state) => state.error);
    const fetchUserConstraints = useConstraintStore((state) => state.fetchUserConstraints);
    const fetchUserConstraintsByUser = useConstraintStore((state) => state.fetchUserConstraintsByUser);
    const createUserConstraint = useConstraintStore((state) => state.createUserConstraint);
    const updateUserConstraint = useConstraintStore((state) => state.updateUserConstraint);
    const deleteUserConstraint = useConstraintStore((state) => state.deleteUserConstraint);

    return {
        userConstraints,
        isLoading,
        error,
        fetchUserConstraints,
        fetchUserConstraintsByUser,
        createUserConstraint,
        updateUserConstraint,
        deleteUserConstraint,
    };
}

/**
 * Hook for user preferences management
 */
export function useUserPreferences() {
    const userPreferences = useConstraintStore((state) => state.userPreferences);
    const isLoading = useConstraintStore((state) => state.isLoading);
    const error = useConstraintStore((state) => state.error);
    const fetchUserPreferences = useConstraintStore((state) => state.fetchUserPreferences);
    const fetchUserPreferencesByUser = useConstraintStore((state) => state.fetchUserPreferencesByUser);
    const createUserPreference = useConstraintStore((state) => state.createUserPreference);
    const updateUserPreference = useConstraintStore((state) => state.updateUserPreference);
    const deleteUserPreference = useConstraintStore((state) => state.deleteUserPreference);

    return {
        userPreferences,
        isLoading,
        error,
        fetchUserPreferences,
        fetchUserPreferencesByUser,
        createUserPreference,
        updateUserPreference,
        deleteUserPreference,
    };
}

/**
 * Hook for activity constraints management
 */
export function useActivityConstraints() {
    const activityConstraints = useConstraintStore((state) => state.activityConstraints);
    const isLoading = useConstraintStore((state) => state.isLoading);
    const error = useConstraintStore((state) => state.error);
    const fetchActivityConstraints = useConstraintStore((state) => state.fetchActivityConstraints);
    const fetchActivityConstraintsByActivity = useConstraintStore((state) => state.fetchActivityConstraintsByActivity);
    const createActivityConstraint = useConstraintStore((state) => state.createActivityConstraint);
    const updateActivityConstraint = useConstraintStore((state) => state.updateActivityConstraint);
    const deleteActivityConstraint = useConstraintStore((state) => state.deleteActivityConstraint);

    return {
        activityConstraints,
        isLoading,
        error,
        fetchActivityConstraints,
        fetchActivityConstraintsByActivity,
        createActivityConstraint,
        updateActivityConstraint,
        deleteActivityConstraint,
    };
}

