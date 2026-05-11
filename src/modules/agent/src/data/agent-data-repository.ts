import type {
    AgentSessionResponse,
    StartSessionRequest,
    SendMessageRequest,
} from "./agent.types";

const BASE_PATH = "/api/agent/sessions";

export class AgentDataRepository {
    private getOrganizationId(): string {
        const organization = $app.organization.getOrganization();
        if (!organization) {
            throw new Error("No organization context available");
        }
        return organization.id;
    }

    private getHeaders() {
        return {
            "x-org-id": this.getOrganizationId(),
        };
    }

    /** POST /api/agent/sessions */
    async createSession(request: StartSessionRequest): Promise<{ sessionId: string }> {
        const headers = this.getHeaders();
        return $app.ajax.post<{ sessionId: string }>(BASE_PATH, request, { headers });
    }

    /** POST /api/agent/sessions/{id}/messages */
    async sendMessage(sessionId: string, request: SendMessageRequest): Promise<AgentSessionResponse> {
        const headers = this.getHeaders();
        return $app.ajax.post<AgentSessionResponse>(`${BASE_PATH}/${sessionId}/messages`, request, { headers });
    }

    /** POST /api/agent/sessions/{id}/submit */
    async requestSubmit(sessionId: string): Promise<AgentSessionResponse> {
        const headers = this.getHeaders();
        return $app.ajax.post<AgentSessionResponse>(`${BASE_PATH}/${sessionId}/submit`, undefined, { headers });
    }

    /** POST /api/agent/sessions/{id}/approve */
    async approveProposal(sessionId: string): Promise<AgentSessionResponse> {
        const headers = this.getHeaders();
        return $app.ajax.post<AgentSessionResponse>(`${BASE_PATH}/${sessionId}/approve`, undefined, { headers });
    }

    /** POST /api/agent/sessions/{id}/revise */
    async requestRevision(sessionId: string): Promise<AgentSessionResponse> {
        const headers = this.getHeaders();
        return $app.ajax.post<AgentSessionResponse>(`${BASE_PATH}/${sessionId}/revise`, undefined, { headers });
    }
}

export const agentDataRepository = new AgentDataRepository();
