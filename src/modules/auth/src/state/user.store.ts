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
import { translatedResources } from "@/infra/i18n";
import { sharedNotifications } from "@/infra/i18n/shared-notifications";
import resourcesJson from "./user.store.resources.json";

const resources = translatedResources(
    "src/modules/auth/src/state/user.store.resources.json",
    resourcesJson,
);

interface UserStore {
    users: UserResponse[];
    isLoading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    createUser: (request: CreateUserRequest) => Promise<UserResponse | null>;
    updateUser: (
        userId: string,
        request: UserUpdateRequest,
    ) => Promise<boolean>;
    updateMyProfile: (request: UserUpdateRequest) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await userDataRepository.getAllUsers();
            set({ users: data, isLoading: false });
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.fetchError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching users:", err);
        }
    },

    createUser: async (request: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.creating,
        );
        try {
            const newUser = await userDataRepository.createUser(request);
            set({ isLoading: false });
            await get().fetchUsers();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.createSuccess,
            );
            return newUser;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.createError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                sharedNotifications.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.createError,
            );
            return null;
        }
    },

    updateUser: async (userId: string, request: UserUpdateRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.updating,
        );
        try {
            await userDataRepository.updateUser(userId, request);
            set({ isLoading: false });
            await get().fetchUsers();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.updateSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.updateError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                sharedNotifications.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.updateError,
            );
            return false;
        }
    },

    updateMyProfile: async (request: UserUpdateRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.updatingProfile,
        );
        try {
            await userDataRepository.updateMyProfile(request);
            set({ isLoading: false });
            await get().fetchUsers();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.updateProfileSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.updateProfileError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating profile:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                sharedNotifications.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.updateProfileError,
            );
            return false;
        }
    },

    deleteUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.deleting,
        );
        try {
            await userDataRepository.deleteUser(userId);
            set({ isLoading: false });
            await get().fetchUsers();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.deleteSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.deleteError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error deleting user:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                sharedNotifications.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.deleteError,
            );
            return false;
        }
    },

    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
