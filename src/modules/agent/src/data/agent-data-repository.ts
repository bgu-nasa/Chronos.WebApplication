/**
 * Agent data repository
 * Handles agent chat API calls
 */

import type {
    AgentResponse,
    SendMessageRequest,
} from "./agent.types";

// TODO: Replace with actual API paths once backend controllers are ready
const BASE_PATH = "/api/agent/sessions";

/**
 * Agent repository class
 * Provides methods for managing chat sessions with the agent
 */
export class AgentDataRepository {
    /**
     * Create a new conversation session
     * @returns The initial agent response with session ID
     */
    async createSession(): Promise<AgentResponse> {
        // TODO: Confirm endpoint with backend
        return $app.ajax.post<AgentResponse>(BASE_PATH);
    }

    /**
     * Send a message to an existing conversation session
     * @param sessionId - The conversation session ID
     * @param request - The message to send
     * @returns The agent's response including updated messages and optional proposal
     */
    async sendMessage(sessionId: string, request: SendMessageRequest): Promise<AgentResponse> {
        // TODO: Confirm endpoint with backend
        return $app.ajax.post<AgentResponse>(`${BASE_PATH}/${sessionId}/messages`, request);
    }

    /**
     * Approve the agent's constraint/preference proposal
     * @param sessionId - The conversation session ID
     * @returns The agent's response after committing constraints
     */
    async approveProposal(sessionId: string): Promise<AgentResponse> {
        // TODO: Confirm endpoint with backend
        return $app.ajax.post<AgentResponse>(`${BASE_PATH}/${sessionId}/approve`);
    }

    /**
     * Reject the proposal and request revision
     * @param sessionId - The conversation session ID
     * @returns The agent's response after entering revision mode
     */
    async requestRevision(sessionId: string): Promise<AgentResponse> {
        // TODO: Confirm endpoint with backend
        return $app.ajax.post<AgentResponse>(`${BASE_PATH}/${sessionId}/revise`);
    }
}

export const agentDataRepository = new AgentDataRepository();
