import type {
    AgentTurnResponse,
    StartAgentSessionRequest,
    SendAgentMessageRequest,
    ApproveAgentSessionRequest,
    ApproveAgentSessionResponse,
} from "./agent.types";

class AgentDataRepository {
    private getHeaders() {
        const organization = $app.organization.getOrganization();
        if (!organization) {
            throw new Error("No organization context available");
        }

        return {
            "x-org-id": organization.id,
        };
    }

    async startSession(request: StartAgentSessionRequest): Promise<AgentTurnResponse> {
        return $app.ajax.post<AgentTurnResponse>("/api/agent/session/start", request, {
            headers: this.getHeaders(),
        });
    }

    async sendMessage(request: SendAgentMessageRequest): Promise<AgentTurnResponse> {
        return $app.ajax.post<AgentTurnResponse>("/api/agent/session/message", request, {
            headers: this.getHeaders(),
        });
    }

    async revise(request: SendAgentMessageRequest): Promise<AgentTurnResponse> {
        return $app.ajax.post<AgentTurnResponse>("/api/agent/session/revise", request, {
            headers: this.getHeaders(),
        });
    }

    async approve(request: ApproveAgentSessionRequest): Promise<ApproveAgentSessionResponse> {
        return $app.ajax.post<ApproveAgentSessionResponse>("/api/agent/session/approve", request, {
            headers: this.getHeaders(),
        });
    }

    async getSession(sessionId: string): Promise<AgentTurnResponse> {
        return $app.ajax.get<AgentTurnResponse>(`/api/agent/session/${sessionId}`, {
            headers: this.getHeaders(),
        });
    }
}

export const agentDataRepository = new AgentDataRepository();
