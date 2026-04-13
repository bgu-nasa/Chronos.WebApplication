import { create } from "zustand";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import type {
    AppealResponse,
    CreateAppealRequest,
    UpdateAppealRequest,
} from "@/modules/schedule/src/data/appeal.types";

interface AppealStore {
    appeals: AppealResponse[];
    isLoading: boolean;
    error: string | null;

    fetchAppeals: () => Promise<void>;
    fetchAppealsByAssignment: (assignmentId: string) => Promise<void>;
    createAppeal: (request: CreateAppealRequest) => Promise<AppealResponse | null>;
    updateAppeal: (appealId: string, request: UpdateAppealRequest) => Promise<boolean>;
    deleteAppeal: (appealId: string) => Promise<boolean>;

    setError: (error: string | null) => void;
    clearError: () => void;
    clearAppeals: () => void;
}

export const useAppealStore = create<AppealStore>((set, get) => ({
    appeals: [],
    isLoading: false,
    error: null,

    fetchAppeals: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await appealDataRepository.getAllAppeals();
            set({ appeals: data, isLoading: false });
        } catch (err) {
            let errorMessage = "Failed to fetch appeals";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching appeals:", err);
        }
    },

    fetchAppealsByAssignment: async (assignmentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await appealDataRepository.getAppealsByAssignment(assignmentId);
            set({ appeals: data, isLoading: false });
        } catch (err) {
            let errorMessage = "Failed to fetch appeals";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching appeals:", err);
        }
    },

    createAppeal: async (request: CreateAppealRequest) => {
        set({ isLoading: true, error: null });
        try {
            const newAppeal = await appealDataRepository.createAppeal(request);
            set({ isLoading: false });
            await get().fetchAppeals();
            return newAppeal;
        } catch (err) {
            let errorMessage = "Failed to create appeal";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating appeal:", err);
            return null;
        }
    },

    updateAppeal: async (appealId: string, request: UpdateAppealRequest) => {
        set({ isLoading: true, error: null });
        try {
            await appealDataRepository.updateAppeal(appealId, request);
            set({ isLoading: false });
            await get().fetchAppeals();
            return true;
        } catch (err) {
            let errorMessage = "Failed to update appeal";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating appeal:", err);
            return false;
        }
    },

    deleteAppeal: async (appealId: string) => {
        set({ isLoading: true, error: null });
        try {
            await appealDataRepository.deleteAppeal(appealId);
            set({ isLoading: false });
            await get().fetchAppeals();
            return true;
        } catch (err) {
            let errorMessage = "Failed to delete appeal";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error deleting appeal:", err);
            return false;
        }
    },

    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    clearAppeals: () => set({ appeals: [], error: null }),
}));
