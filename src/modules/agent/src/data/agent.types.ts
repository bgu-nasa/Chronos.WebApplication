/**
 * Agent chat data types
 * Matches the backend Chronos.Agent conversation contracts
 */

/**
 * A single chat message in the conversation
 */
export interface ChatMessage {
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

/**
 * A single item in a constraint/preference proposal
 */
export interface ProposalItem {
    key: string;
    value: string;
}

/**
 * The agent's structured constraint/preference proposal
 * Presented to the user for approval when the agent has extracted enough information
 */
export interface ConstraintProposal {
    hardConstraints: ProposalItem[];
    softPreferences: ProposalItem[];
}

/**
 * Response shape returned by the backend on every interaction
 */
export interface AgentResponse {
    sessionId: string;
    messages: ChatMessage[];
    proposal: ConstraintProposal | null;
}

/**
 * Request body for sending a message to the agent
 */
export interface SendMessageRequest {
    content: string;
}
