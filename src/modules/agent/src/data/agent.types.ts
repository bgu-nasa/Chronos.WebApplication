/** FSM states from Chronos.Agent.Conversation.AgentState */
export type AgentState = "Discovery" | "Drafting" | "Submit" | "Revision" | "Approved";

/** User-facing actions from Chronos.Agent.Conversation.AgentAction */
export type AgentAction = "ContinueConversation" | "Submit" | "Approve" | "Revise";

/**
 * A single chat message in the conversation.
 * Maintained locally by the frontend — the backend only returns the latest assistant reply.
 */
export interface ChatMessage {
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

/** Maps to Chronos.MainApi.Agent.Contracts.DraftItemResponse */
export interface DraftItemResponse {
    key: string;
    value: string;
}

/** Maps to Chronos.MainApi.Agent.Contracts.DraftResponse */
export interface DraftResponse {
    hardConstraints: DraftItemResponse[];
    softPreferences: DraftItemResponse[];
}

/**
 * Response returned by the backend on every agent interaction
 * (sendMessage, requestSubmit, approve, revise).
 */
export interface AgentSessionResponse {
    sessionId: string;
    state: AgentState;
    assistantMessage: string;
    draft: DraftResponse | null;
    allowedActions: AgentAction[];
}

/** Body for POST /api/agent/sessions */
export interface StartSessionRequest {
    schedulingPeriodId: string;
}

/** Body for POST /api/agent/sessions/{id}/messages */
export interface SendMessageRequest {
    message: string;
}
