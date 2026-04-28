/**
 * Agent Store
 * Zustand store for agent chat state management
 */

import { create } from "zustand";
import { agentDataRepository } from "@/modules/agent/src/data";
import type {
    ChatMessage,
    ConstraintProposal,
} from "@/modules/agent/src/data";

interface AgentStore {
    sessionId: string | null;
    messages: ChatMessage[];
    proposal: ConstraintProposal | null;
    isLoading: boolean;
    isSending: boolean;
    error: string | null;

    createSession: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    approveProposal: () => Promise<void>;
    requestRevision: () => Promise<void>;
    resetSession: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
    sessionId: null,
    messages: [],
    proposal: null,
    isLoading: false,
    isSending: false,
    error: null,

    createSession: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await agentDataRepository.createSession();
            set({
                sessionId: response.sessionId,
                messages: response.messages,
                proposal: response.proposal,
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to start conversation";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[AgentStore] Error creating session", err);
            $app.notifications.showError(errorMessage);
        }
    },

    sendMessage: async (content: string) => {
        const { sessionId, messages } = get();
        if (!sessionId) return;

        const userMessage: ChatMessage = {
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };
        set({ messages: [...messages, userMessage], isSending: true, error: null });

        try {
            const response = await agentDataRepository.sendMessage(sessionId, { content });
            set({
                messages: response.messages,
                proposal: response.proposal,
                isSending: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to send message";
            set({ error: errorMessage, isSending: false });
            $app.logger.error("[AgentStore] Error sending message", err);
            $app.notifications.showError(errorMessage);
        }
    },

    approveProposal: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await agentDataRepository.approveProposal(sessionId);
            set({
                messages: response.messages,
                proposal: response.proposal,
                isLoading: false,
            });
            $app.notifications.showSuccess("Constraints saved successfully");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to approve proposal";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[AgentStore] Error approving proposal", err);
            $app.notifications.showError(errorMessage);
        }
    },

    requestRevision: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await agentDataRepository.requestRevision(sessionId);
            set({
                messages: response.messages,
                proposal: response.proposal,
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to request revision";
            set({ error: errorMessage, isLoading: false });
            $app.logger.error("[AgentStore] Error requesting revision", err);
            $app.notifications.showError(errorMessage);
        }
    },

    resetSession: () => set({
        sessionId: null,
        messages: [],
        proposal: null,
        isLoading: false,
        isSending: false,
        error: null,
    }),
}));
