/**
 * Scheduling Period Store
 * Zustand store for centralized scheduling period state management
 */

import { create } from "zustand";
import { schedulingPeriodDataRepository } from "@/modules/schedule/src/data/scheduling-period-data-repository";
import type {
    SchedulingPeriodResponse,
    CreateSchedulingPeriodRequest,
    UpdateSchedulingPeriodRequest,
} from "@/modules/schedule/src/data/scheduling-period.types";

interface SchedulingPeriodStore {
    // State
    schedulingPeriods: SchedulingPeriodResponse[];
    unfinishedSchedulingPeriods: SchedulingPeriodResponse[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSchedulingPeriods: () => Promise<void>;
    fetchUnfinishedSchedulingPeriods: () => Promise<void>;
    createSchedulingPeriod: (
        request: CreateSchedulingPeriodRequest
    ) => Promise<SchedulingPeriodResponse | null>;
    updateSchedulingPeriod: (
        schedulingPeriodId: string,
        request: UpdateSchedulingPeriodRequest
    ) => Promise<boolean>;
    deleteSchedulingPeriod: (schedulingPeriodId: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useSchedulingPeriodStore = create<SchedulingPeriodStore>((set, get) => ({
    // Initial state
    schedulingPeriods: [],
    unfinishedSchedulingPeriods: [],
    isLoading: false,
    error: null,

    // Fetch all scheduling periods
    fetchSchedulingPeriods: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await schedulingPeriodDataRepository.getAllSchedulingPeriods();
            set({ schedulingPeriods: data, isLoading: false });
        } catch (err) {
            let errorMessage = "Failed to fetch scheduling periods";
            if (err && typeof err === "object" && "status" in err && "message" in err) {
                const apiError = err as { status: number; message: string };
                errorMessage = apiError.status
                    ? `Error ${apiError.status}: ${apiError.message}`
                    : apiError.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching scheduling periods:", err);
        }
    },

    // Fetch only unfinished scheduling periods (toDate > now)
    fetchUnfinishedSchedulingPeriods: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await schedulingPeriodDataRepository.getUnfinishedSchedulingPeriods();
            set({ unfinishedSchedulingPeriods: data, isLoading: false });
        } catch (err) {
            let errorMessage = "Failed to fetch unfinished scheduling periods";
            if (err && typeof err === "object" && "status" in err && "message" in err) {
                const apiError = err as { status: number; message: string };
                errorMessage = apiError.status
                    ? `Error ${apiError.status}: ${apiError.message}`
                    : apiError.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error fetching unfinished scheduling periods:", err);
        }
    },

    // Create a scheduling period and refetch
    createSchedulingPeriod: async (request: CreateSchedulingPeriodRequest) => {
        set({ isLoading: true, error: null });
        try {
            const newPeriod = await schedulingPeriodDataRepository.createSchedulingPeriod(request);
            set({ isLoading: false });
            await get().fetchSchedulingPeriods();
            return newPeriod;
        } catch (err) {
            let errorMessage = "Failed to create scheduling period";
            if (err && typeof err === "object" && "status" in err && "message" in err) {
                const apiError = err as { status: number; message: string };
                errorMessage = apiError.status
                    ? `Error ${apiError.status}: ${apiError.message}`
                    : apiError.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error creating scheduling period:", err);
            return null;
        }
    },

    // Update a scheduling period and refetch
    updateSchedulingPeriod: async (
        schedulingPeriodId: string,
        request: UpdateSchedulingPeriodRequest
    ) => {
        set({ isLoading: true, error: null });
        try {
            await schedulingPeriodDataRepository.updateSchedulingPeriod(
                schedulingPeriodId,
                request
            );
            set({ isLoading: false });
            await get().fetchSchedulingPeriods();
            return true;
        } catch (err) {
            let errorMessage = "Failed to update scheduling period";
            if (err && typeof err === "object" && "status" in err && "message" in err) {
                const apiError = err as { status: number; message: string };
                errorMessage = apiError.status
                    ? `Error ${apiError.status}: ${apiError.message}`
                    : apiError.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error updating scheduling period:", err);
            return false;
        }
    },

    // Delete a scheduling period and refetch
    deleteSchedulingPeriod: async (schedulingPeriodId: string) => {
        set({ isLoading: true, error: null });
        try {
            await schedulingPeriodDataRepository.deleteSchedulingPeriod(schedulingPeriodId);
            set({ isLoading: false });
            await get().fetchSchedulingPeriods();
            return true;
        } catch (err) {
            let errorMessage = "Failed to delete scheduling period";
            if (err && typeof err === "object" && "status" in err && "message" in err) {
                const apiError = err as { status: number; message: string };
                errorMessage = apiError.status
                    ? `Error ${apiError.status}: ${apiError.message}`
                    : apiError.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("Error deleting scheduling period:", err);
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));
