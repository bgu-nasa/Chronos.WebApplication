/**
 * User Store
 * Zustand store for centralized user state management
 */

import { create } from "zustand";
import { userDataRepository } from "@/modules/auth/src/data/user-data-repository";
import type {
    UserResponse,
    CreateUserRequest,
    UserUpdateRequest,
} from "@/modules/auth/src/data/user.types";
import type { ApiError } from "@/infra/service/ajax/types";

const getErrorDetailsMessage = (details: unknown): string | undefined => {
    if (details == null) {
        return undefined;
    }

    return typeof details === "string" ? details : JSON.stringify(details);
};

interface UserStore {
    // State
    users: UserResponse[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchUsers: () => Promise<void>;
    createUser: (request: CreateUserRequest) => Promise<UserResponse | null>;
    updateUser: (
        userId: string,
        request: UserUpdateRequest,
    ) => Promise<boolean>;
    updateMyProfile: (request: UserUpdateRequest) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    // Initial state
    users: [],
    isLoading: false,
    error: null,

    // Fetch all users
    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await userDataRepository.getAllUsers();
            set({ users: data, isLoading: false });
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.user.error.fetch");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching users:", err);
        }
    },

    // Create a user and refetch
    createUser: async (request: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.user.loading.create"),
        );
        try {
            const newUser = await userDataRepository.createUser(request);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUsers();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.user.success.create"),
            );
            return newUser;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.user.error.create");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.user.error.create"),
                getErrorDetailsMessage(apiError.details),
            );
            return null;
        }
    },

    // Update a user and refetch
    updateUser: async (userId: string, request: UserUpdateRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.user.loading.update"),
        );
        try {
            await userDataRepository.updateUser(userId, request);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUsers();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.user.success.update"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.user.error.update");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.user.error.update"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Update the authenticated user's own profile
    updateMyProfile: async (request: UserUpdateRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.user.loading.updateProfile"),
        );
        try {
            await userDataRepository.updateMyProfile(request);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUsers();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.user.success.updateProfile"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.user.error.updateProfile");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating profile:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.user.error.updateProfile"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Delete a user and refetch
    deleteUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.user.loading.delete"),
        );
        try {
            await userDataRepository.deleteUser(userId);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchUsers();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.user.success.delete"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.user.error.delete");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error deleting user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.user.error.delete"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
