/**
 * Role Store
 * Zustand store for centralized role assignment state management
 */

import { create } from "zustand";
import { roleDataRepository } from "@/modules/management/src/data/role-data-repository";
import type {
    UserRoleAssignmentSummary,
    RoleAssignmentRequest,
    RoleAssignmentResponse,
} from "@/modules/management/src/data/role.types";
import type { ApiError } from "@/infra/service/ajax/types";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);
import resourcesJson from "./role.store.resources.json";

const resources = translatedResources(
    "src/modules/management/src/state/role.store.resources.json",
    resourcesJson,
);

interface RoleStore {
    roleAssignments: UserRoleAssignmentSummary[];
    isLoading: boolean;
    error: string | null;
    fetchRoleAssignments: () => Promise<void>;
    createRoleAssignment: (
        request: RoleAssignmentRequest,
    ) => Promise<RoleAssignmentResponse | null>;
    removeRoleAssignment: (roleAssignmentId: string) => Promise<boolean>;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
    roleAssignments: [],
    isLoading: false,
    error: null,

    fetchRoleAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await roleDataRepository.getRoleAssignmentsSummary();
            set({ roleAssignments: data, isLoading: false });
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.fetchError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching role assignments:", err);
        }
    },

    createRoleAssignment: async (request: RoleAssignmentRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.creating,
        );
        try {
            const newAssignment =
                await roleDataRepository.createRoleAssignment(request);
            set({ isLoading: false });
            await get().fetchRoleAssignments();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.createSuccess,
            );
            return newAssignment;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.createError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating role assignment:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                notificationResources.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.createError,
            );
            return null;
        }
    },

    removeRoleAssignment: async (roleAssignmentId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.removing,
        );
        try {
            await roleDataRepository.removeRoleAssignment(roleAssignmentId);
            set({ isLoading: false });
            await get().fetchRoleAssignments();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.removeSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.removeError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error removing role assignment:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                notificationResources.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.removeError,
            );
            return false;
        }
    },

    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
