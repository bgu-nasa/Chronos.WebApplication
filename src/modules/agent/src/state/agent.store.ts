import { create } from "zustand";
import { agentDataRepository } from "@/modules/agent/src/data";
import type {
    AgentAction,
    AgentSessionResponse,
    AgentState,
    ChatMessage,
    DraftResponse,
} from "@/modules/agent/src/data";

interface AgentStore {
    sessionId: string | null;
    messages: ChatMessage[];
    state: AgentState | null;
    draft: DraftResponse | null;
    allowedActions: AgentAction[];
    isLoading: boolean;
    isSending: boolean;

    createSession: (schedulingPeriodId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    requestSubmit: () => Promise<void>;
    approveProposal: () => Promise<void>;
    requestRevision: () => Promise<void>;
    resetSession: () => void;
}

function applyResponse(response: AgentSessionResponse, get: () => AgentStore): Partial<AgentStore> {
    const messages = response.assistantMessage
        ? [...get().messages, { role: "agent" as const, content: response.assistantMessage, timestamp: new Date().toISOString() }]
        : get().messages;

    return {
        messages,
        state: response.state,
        draft: response.draft,
        allowedActions: response.allowedActions,
    };
}

export const useAgentStore = create<AgentStore>((set, get) => ({
    sessionId: null,
    messages: [],
    state: null,
    draft: null,
    allowedActions: [],
    isLoading: false,
    isSending: false,

    createSession: async (schedulingPeriodId: string) => {
        set({ isLoading: true });
        try {
            const { sessionId } = await agentDataRepository.createSession({ schedulingPeriodId });
            set({
                sessionId,
                state: "Discovery",
                allowedActions: ["ContinueConversation", "Submit"],
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to start conversation";
            set({ isLoading: false });
            $app.logger.error("[AgentStore] Error creating session", err);
            $app.notifications.showError(msg);
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
        set({ messages: [...messages, userMessage], isSending: true });

        try {
            const response = await agentDataRepository.sendMessage(sessionId, { message: content });
            set({ ...applyResponse(response, get), isSending: false });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to send message";
            set({ isSending: false });
            $app.logger.error("[AgentStore] Error sending message", err);
            $app.notifications.showError(msg);
        }
    },

    requestSubmit: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true });
        try {
            const response = await agentDataRepository.requestSubmit(sessionId);
            set({ ...applyResponse(response, get), isLoading: false });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to generate proposal";
            set({ isLoading: false });
            $app.logger.error("[AgentStore] Error requesting submit", err);
            $app.notifications.showError(msg);
        }
    },

    approveProposal: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true });
        try {
            const response = await agentDataRepository.approveProposal(sessionId);
            set({ ...applyResponse(response, get), isLoading: false });
            $app.notifications.showSuccess("Constraints saved successfully");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to approve proposal";
            set({ isLoading: false });
            $app.logger.error("[AgentStore] Error approving proposal", err);
            $app.notifications.showError(msg);
        }
    },

    requestRevision: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true });
        try {
            const response = await agentDataRepository.requestRevision(sessionId);
            set({ ...applyResponse(response, get), isLoading: false });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to request revision";
            set({ isLoading: false });
            $app.logger.error("[AgentStore] Error requesting revision", err);
            $app.notifications.showError(msg);
        }
    },

    resetSession: () => set({
        sessionId: null,
        messages: [],
        state: null,
        draft: null,
        allowedActions: [],
        isLoading: false,
        isSending: false,
    }),
}));
