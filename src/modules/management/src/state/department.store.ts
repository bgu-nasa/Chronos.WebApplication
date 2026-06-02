/**
 * Department Store
 * Zustand store for centralized department state management
 */

import { create } from "zustand";
import { departmentDataRepository } from "@/modules/management/src/data/department-data-repository";
import type {
    DepartmentResponse,
    DepartmentRequest,
} from "@/modules/management/src/data/department.types";
import type { ApiError } from "@/infra/service/ajax/types";
import { translatedResources } from "@/infra/i18n";
import { sharedNotifications } from "@/infra/i18n/shared-notifications";
import resourcesJson from "./department.store.resources.json";

const resources = translatedResources(
    "src/modules/management/src/state/department.store.resources.json",
    resourcesJson,
);

interface DepartmentStore {
    departments: DepartmentResponse[];
    isLoading: boolean;
    error: string | null;
    fetchDepartments: () => Promise<void>;
    createDepartment: (
        request: DepartmentRequest,
    ) => Promise<DepartmentResponse | null>;
    updateDepartment: (
        departmentId: string,
        request: DepartmentRequest,
    ) => Promise<boolean>;
    deleteDepartment: (departmentId: string) => Promise<boolean>;
    restoreDepartment: (departmentId: string) => Promise<boolean>;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useDepartmentStore = create<DepartmentStore>((set, get) => ({
    departments: [],
    isLoading: false,
    error: null,

    fetchDepartments: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await departmentDataRepository.getAllDepartments();
            set({ departments: data, isLoading: false });
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.fetchError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching departments:", err);
        }
    },

    createDepartment: async (request: DepartmentRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.creating,
        );
        try {
            const newDepartment =
                await departmentDataRepository.createDepartment(request);
            set({ isLoading: false });
            await get().fetchDepartments();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.createSuccess,
            );
            return newDepartment;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.createError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating department:", err);
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

    updateDepartment: async (
        departmentId: string,
        request: DepartmentRequest,
    ) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.updating,
        );
        try {
            await departmentDataRepository.updateDepartment(
                departmentId,
                request,
            );
            set({ isLoading: false });
            await get().fetchDepartments();
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
            $app.logger.error("Error updating department:", err);
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

    deleteDepartment: async (departmentId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.deleting,
        );
        try {
            await departmentDataRepository.deleteDepartment(departmentId);
            set({ isLoading: false });
            await get().fetchDepartments();
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
            $app.logger.error("Error deleting department:", err);
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

    restoreDepartment: async (departmentId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.restoring,
        );
        try {
            await departmentDataRepository.restoreDepartment(departmentId);
            set({ isLoading: false });
            await get().fetchDepartments();
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                sharedNotifications.successTitle,
                resources.notifications.restoreSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.restoreError;
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error restoring department:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                sharedNotifications.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.restoreError,
            );
            return false;
        }
    },

    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
