/**
 * Generic confirmation dialog hook
 * Provides state management for confirmation dialogs
 */

import { useState, useCallback } from "react";

export interface ConfirmationState {
    /** Whether the confirmation dialog is open */
    isOpen: boolean;
    /** Title of the confirmation dialog */
    title: string;
    /** Message of the confirmation dialog */
    message: string;
    /** Confirm button text (optional) */
    confirmText?: string;
    /** Cancel button text (optional) */
    cancelText?: string;
    /** Callback to execute when confirmed */
    onConfirm: (() => void | Promise<void>) | null;
}

export interface UseConfirmationReturn {
    /** Current confirmation state */
    confirmationState: ConfirmationState;
    /** Open the confirmation dialog */
    openConfirmation: (params: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void | Promise<void>;
    }) => void;
    /** Close the confirmation dialog */
    closeConfirmation: () => void;
    /** Handle confirmation action */
    handleConfirm: () => Promise<void>;
    /** Whether an async action is in progress */
    isLoading: boolean;
}

/**
 * Hook for managing confirmation dialog state
 * @returns Confirmation dialog state and handlers
 */
export function useConfirmation(): UseConfirmationReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationState, setConfirmationState] =
        useState<ConfirmationState>({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
        });

    const openConfirmation = useCallback(
        (params: {
            title: string;
            message: string;
            confirmText?: string;
            cancelText?: string;
            onConfirm: () => void | Promise<void>;
        }) => {
            setConfirmationState({
                isOpen: true,
                title: params.title,
                message: params.message,
                confirmText: params.confirmText,
                cancelText: params.cancelText,
                onConfirm: params.onConfirm,
            });
        },
        [],
    );

    const closeConfirmation = useCallback(() => {
        if (!isLoading) {
            setConfirmationState({
                isOpen: false,
                title: "",
                message: "",
                confirmText: undefined,
                cancelText: undefined,
                onConfirm: null,
            });
        }
    }, [isLoading]);

    const handleConfirm = useCallback(async () => {
        if (confirmationState.onConfirm) {
            setIsLoading(true);
            try {
                await confirmationState.onConfirm();
                closeConfirmation();
            } catch (error) {
                $app.logger.error("Error during confirmation action:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [confirmationState.onConfirm, closeConfirmation]);

    return {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading,
    };
}
