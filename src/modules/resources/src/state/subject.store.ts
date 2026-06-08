/**
 * Subject Store
 * Zustand store for centralized subject state management
 */

import { create } from "zustand";
import { subjectDataRepository } from "@/modules/resources/src/data";
import type {
    SubjectResponse,
    CreateSubjectRequest,
    UpdateSubjectRequest,
} from "@/modules/resources/src/data";

interface SubjectStore {
    // State
    subjects: SubjectResponse[];
    currentDepartmentId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setCurrentDepartment: (departmentId: string) => void;
    getDepartmentId: () => string;
    fetchSubjects: () => Promise<void>;
    createSubject: (request: CreateSubjectRequest) => Promise<SubjectResponse | null>;
    updateSubject: (subjectId: string, request: UpdateSubjectRequest) => Promise<boolean>;
    deleteSubject: (subjectId: string) => Promise<boolean>;

    // Utility actions
    setError: (error: string | null) => void;
    clearError: () => void;
    clearState: () => void;
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
    // Initial state
    subjects: [],
    currentDepartmentId: null,
    isLoading: false,
    error: null,

    // Set current department
    setCurrentDepartment: (departmentId: string) => {
        // Clear subjects when changing departments to avoid showing stale data
        set({ currentDepartmentId: departmentId, subjects: [] });
    },

    // Helper to get department ID
    getDepartmentId: (): string => {
        const { currentDepartmentId } = get();
        if (!currentDepartmentId) {
            throw new Error("No department context set. Call setCurrentDepartment first.");
        }
        return currentDepartmentId;
    },

    // Fetch all subjects
    fetchSubjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const departmentId = get().getDepartmentId();
            const data = await subjectDataRepository.getAllSubjects(departmentId);
            set({ subjects: data, isLoading: false });
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch subjects";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[SubjectStore] Error fetching subjects:", err);
        }
    },

    // Create a subject and refetch
    createSubject: async (request: CreateSubjectRequest) => {
        $app.logger.info("[SubjectStore] createSubject called");
        set({ isLoading: true, error: null });
        try {
            $app.logger.info("[SubjectStore] Department ID:", request.departmentId);
            $app.logger.info("[SubjectStore] Request:", JSON.stringify(request, null, 2));
            
            const newSubject = await subjectDataRepository.createSubject(
                request.departmentId,
                request
            );
            
            $app.logger.info("[SubjectStore] Subject created successfully:", newSubject);
            set({ isLoading: false });

            // Refetch to update the list
            $app.logger.info("[SubjectStore] Refetching subjects...");
            await get().fetchSubjects();

            return newSubject;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create subject";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[SubjectStore] Error creating subject:", err);
            return null;
        }
    },

    // Update a subject and refetch
    updateSubject: async (
        subjectId: string,
        request: UpdateSubjectRequest
    ) => {
        $app.logger.info("[SubjectStore] updateSubject called");
        $app.logger.info("[SubjectStore] Subject ID:", subjectId);
        $app.logger.info("[SubjectStore] Request:", JSON.stringify(request, null, 2));
        
        set({ isLoading: true, error: null });
        try {
            $app.logger.info("[SubjectStore] Department ID:", request.departmentId);
            
            await subjectDataRepository.updateSubject(
                request.departmentId,
                subjectId,
                request
            );
            
            $app.logger.info("[SubjectStore] Subject updated successfully");
            set({ isLoading: false });

            // Refetch to update the list
            $app.logger.info("[SubjectStore] Refetching subjects...");
            await get().fetchSubjects();

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update subject";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[SubjectStore] Error updating subject:", err);
            return false;
        }
    },

    // Delete a subject and refetch
    deleteSubject: async (subjectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const departmentId = get().getDepartmentId();
            await subjectDataRepository.deleteSubject(departmentId, subjectId);
            set({ isLoading: false });

            // Refetch to update the list
            await get().fetchSubjects();

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to delete subject";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[SubjectStore] Error deleting subject:", err);
            return false;
        }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    clearState: () => set({ subjects: [], currentDepartmentId: null, error: null }),
}));
