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

const getErrorDetailsMessage = (details: unknown): string | undefined => {
    if (details == null) {
        return undefined;
    }

    return typeof details === "string" ? details : JSON.stringify(details);
};

interface DepartmentStore {
    // State
    departments: DepartmentResponse[];
    isLoading: boolean;
    error: string | null;

    // Actions
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

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useDepartmentStore = create<DepartmentStore>((set, get) => ({
    // Initial state
    departments: [],
    isLoading: false,
    error: null,

    // Fetch all departments
    fetchDepartments: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await departmentDataRepository.getAllDepartments();
            set({ departments: data, isLoading: false });
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.department.error.fetch");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching departments:", err);
        }
    },

    // Create a department and refetch
    createDepartment: async (request: DepartmentRequest) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.department.loading.create"),
        );
        try {
            const newDepartment =
                await departmentDataRepository.createDepartment(request);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchDepartments();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.department.success.create"),
            );
            return newDepartment;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.department.error.create");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating department:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.department.error.create"),
                getErrorDetailsMessage(apiError.details),
            );
            return null;
        }
    },

    // Update a department and refetch
    updateDepartment: async (
        departmentId: string,
        request: DepartmentRequest,
    ) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.department.loading.update"),
        );
        try {
            await departmentDataRepository.updateDepartment(
                departmentId,
                request,
            );
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchDepartments();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.department.success.update"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.department.error.update");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating department:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.department.error.update"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Delete a department and refetch
    deleteDepartment: async (departmentId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.department.loading.delete"),
        );
        try {
            await departmentDataRepository.deleteDepartment(departmentId);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchDepartments();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.department.success.delete"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.department.error.delete");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error deleting department:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.department.error.delete"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Restore a department and refetch
    restoreDepartment: async (departmentId: string) => {
        set({ isLoading: true, error: null });
        const loadingNotification = $app.notifications.showLoading(
            $app.localization.t("notifications.department.loading.restore"),
        );
        try {
            await departmentDataRepository.restoreDepartment(departmentId);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchDepartments();

            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                $app.localization.t("notifications.department.success.restore"),
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message ||
                $app.localization.t("notifications.department.error.restore");
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error restoring department:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                $app.localization.t("notifications.department.error.restore"),
                getErrorDetailsMessage(apiError.details),
            );
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
