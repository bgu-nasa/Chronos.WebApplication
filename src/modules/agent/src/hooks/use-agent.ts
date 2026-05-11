import { useAgentStore } from "@/modules/agent/src/state";

export function useAgent() {
    const sessionId = useAgentStore((s) => s.sessionId);
    const messages = useAgentStore((s) => s.messages);
    const state = useAgentStore((s) => s.state);
    const draft = useAgentStore((s) => s.draft);
    const allowedActions = useAgentStore((s) => s.allowedActions);
    const isLoading = useAgentStore((s) => s.isLoading);
    const isSending = useAgentStore((s) => s.isSending);

    const createSession = useAgentStore((s) => s.createSession);
    const sendMessage = useAgentStore((s) => s.sendMessage);
    const requestSubmit = useAgentStore((s) => s.requestSubmit);
    const approveProposal = useAgentStore((s) => s.approveProposal);
    const requestRevision = useAgentStore((s) => s.requestRevision);
    const resetSession = useAgentStore((s) => s.resetSession);

    return {
        sessionId,
        messages,
        state,
        draft,
        allowedActions,
        isLoading,
        isSending,
        createSession,
        sendMessage,
        requestSubmit,
        approveProposal,
        requestRevision,
        resetSession,
    };
}
