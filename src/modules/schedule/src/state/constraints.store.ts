/**
 * Constraint Store
 * Zustand store for centralized constraint state management
 */

import { create } from "zustand";
import { constraintDataRepository } from "@/modules/schedule/src/data/constraint-data-repository";
import type {
    UserConstraintResponse,
    CreateUserConstraintRequest,
    UpdateUserConstraintRequest,
    UserPreferenceResponse,
    CreateUserPreferenceRequest,
    UpdateUserPreferenceRequest,
    ActivityConstraintResponse,
    CreateActivityConstraintRequest,
    UpdateActivityConstraintRequest,
} from "@/modules/schedule/src/data/constraints.types";
import { $app } from "@/infra/service";

interface ConstraintStore {
    // State
    userConstraints: UserConstraintResponse[];
    userPreferences: UserPreferenceResponse[];
    activityConstraints: ActivityConstraintResponse[];
    isLoading: boolean;
    error: string | null;

    // User Constraints Actions
    fetchUserConstraints: () => Promise<void>;
    fetchUserConstraintsByUser: (userId: string) => Promise<void>;
    createUserConstraint: (request: CreateUserConstraintRequest) => Promise<UserConstraintResponse | null>;
    updateUserConstraint: (id: string, request: UpdateUserConstraintRequest) => Promise<boolean>;
    deleteUserConstraint: (id: string) => Promise<boolean>;

    // User Preferences Actions
    fetchUserPreferences: () => Promise<void>;
    fetchUserPreferencesByUser: (userId: string) => Promise<void>;
    createUserPreference: (request: CreateUserPreferenceRequest) => Promise<UserPreferenceResponse | null>;
    updateUserPreference: (id: string, request: UpdateUserPreferenceRequest) => Promise<boolean>;
    deleteUserPreference: (id: string) => Promise<boolean>;

    // Activity Constraints Actions
    fetchActivityConstraints: () => Promise<void>;
    fetchActivityConstraintsByActivity: (activityId: string) => Promise<void>;
    createActivityConstraint: (request: CreateActivityConstraintRequest) => Promise<ActivityConstraintResponse | null>;
    updateActivityConstraint: (id: string, request: UpdateActivityConstraintRequest) => Promise<boolean>;
    deleteActivityConstraint: (id: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useConstraintStore = create<ConstraintStore>((set, get) => ({
    // Initial state
    userConstraints: [],
    userPreferences: [],
    activityConstraints: [],
    isLoading: false,
    error: null,

    // ========================================================================
    // User Constraints
    // ========================================================================

    fetchUserConstraints: async () => {
        $app.logger.info("[ConstraintStore] fetchUserConstraints called");
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getAllUserConstraints();
            $app.logger.info("[ConstraintStore] Fetched user constraints:", data.length);
            set({ userConstraints: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user constraints";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching user constraints:", err);
        }
    },

    fetchUserConstraintsByUser: async (userId: string) => {
        $app.logger.info("[ConstraintStore] fetchUserConstraintsByUser called", { userId });
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getUserConstraintsByUser(userId);
            $app.logger.info("[ConstraintStore] Fetched user constraints:", data.length);
            set({ userConstraints: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user constraints";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching user constraints by user:", err);
        }
    },

    createUserConstraint: async (request: CreateUserConstraintRequest) => {
        $app.logger.info("[ConstraintStore] createUserConstraint called", { request });
        set({ isLoading: true, error: null });
        try {
            const newConstraint = await constraintDataRepository.createUserConstraint(request);
            $app.logger.info("[ConstraintStore] User constraint created successfully:", newConstraint);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserConstraints();
            return newConstraint;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create user constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error creating user constraint:", err);
            return null;
        }
    },

    updateUserConstraint: async (id: string, request: UpdateUserConstraintRequest) => {
        $app.logger.info("[ConstraintStore] updateUserConstraint called", { id, request });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.updateUserConstraint(id, request);
            $app.logger.info("[ConstraintStore] User constraint updated successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserConstraints();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update user constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error updating user constraint:", err);
            return false;
        }
    },

    deleteUserConstraint: async (id: string) => {
        $app.logger.info("[ConstraintStore] deleteUserConstraint called", { id });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.deleteUserConstraint(id);
            $app.logger.info("[ConstraintStore] User constraint deleted successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserConstraints();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete user constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error deleting user constraint:", err);
            return false;
        }
    },

    // ========================================================================
    // User Preferences
    // ========================================================================

    fetchUserPreferences: async () => {
        $app.logger.info("[ConstraintStore] fetchUserPreferences called");
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getAllUserPreferences();
            $app.logger.info("[ConstraintStore] Fetched user preferences:", data.length);
            set({ userPreferences: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user preferences";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching user preferences:", err);
        }
    },

    fetchUserPreferencesByUser: async (userId: string) => {
        $app.logger.info("[ConstraintStore] fetchUserPreferencesByUser called", { userId });
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getUserPreferencesByUser(userId);
            $app.logger.info("[ConstraintStore] Fetched user preferences:", data.length);
            set({ userPreferences: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch user preferences";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching user preferences by user:", err);
        }
    },

    createUserPreference: async (request: CreateUserPreferenceRequest) => {
        $app.logger.info("[ConstraintStore] createUserPreference called", { request });
        set({ isLoading: true, error: null });
        try {
            const newPreference = await constraintDataRepository.createUserPreference(request);
            $app.logger.info("[ConstraintStore] User preference created successfully:", newPreference);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserPreferences();
            return newPreference;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create user preference";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error creating user preference:", err);
            return null;
        }
    },

    updateUserPreference: async (
        id: string,
        request: UpdateUserPreferenceRequest
    ) => {
        $app.logger.info("[ConstraintStore] updateUserPreference called", { id, request });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.updateUserPreference(id, request);
            $app.logger.info("[ConstraintStore] User preference updated successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserPreferences();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update user preference";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error updating user preference:", err);
            return false;
        }
    },

    deleteUserPreference: async (id: string) => {
        $app.logger.info("[ConstraintStore] deleteUserPreference called", { id });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.deleteUserPreference(id);
            $app.logger.info("[ConstraintStore] User preference deleted successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUserPreferences();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete user preference";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error deleting user preference:", err);
            return false;
        }
    },

    // ========================================================================
    // Activity Constraints
    // ========================================================================

    fetchActivityConstraints: async () => {
        $app.logger.info("[ConstraintStore] fetchActivityConstraints called");
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getAllActivityConstraints();
            $app.logger.info("[ConstraintStore] Fetched activity constraints:", data.length);
            set({ activityConstraints: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch activity constraints";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching activity constraints:", err);
        }
    },

    fetchActivityConstraintsByActivity: async (activityId: string) => {
        $app.logger.info("[ConstraintStore] fetchActivityConstraintsByActivity called", { activityId });
        set({ isLoading: true, error: null });
        try {
            const data = await constraintDataRepository.getActivityConstraintsByActivity(activityId);
            $app.logger.info("[ConstraintStore] Fetched activity constraints:", data.length);
            set({ activityConstraints: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch activity constraints";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error fetching activity constraints by activity:", err);
        }
    },

    createActivityConstraint: async (request: CreateActivityConstraintRequest) => {
        $app.logger.info("[ConstraintStore] createActivityConstraint called", { request });
        set({ isLoading: true, error: null });
        try {
            const newConstraint = await constraintDataRepository.createActivityConstraint(request);
            $app.logger.info("[ConstraintStore] Activity constraint created successfully:", newConstraint);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchActivityConstraints();
            return newConstraint;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create activity constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error creating activity constraint:", err);
            return null;
        }
    },

    updateActivityConstraint: async (id: string, request: UpdateActivityConstraintRequest) => {
        $app.logger.info("[ConstraintStore] updateActivityConstraint called", { id, request });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.updateActivityConstraint(id, request);
            $app.logger.info("[ConstraintStore] Activity constraint updated successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchActivityConstraints();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update activity constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error updating activity constraint:", err);
            return false;
        }
    },

    deleteActivityConstraint: async (id: string) => {
        $app.logger.info("[ConstraintStore] deleteActivityConstraint called", { id });
        set({ isLoading: true, error: null });
        try {
            await constraintDataRepository.deleteActivityConstraint(id);
            $app.logger.info("[ConstraintStore] Activity constraint deleted successfully");
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchActivityConstraints();
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete activity constraint";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[ConstraintStore] Error deleting activity constraint:", err);
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));