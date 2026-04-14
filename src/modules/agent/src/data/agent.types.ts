export type AgentDraftItemResponse = {
    key: string;
    value: string;
};

export type AgentTurnResponse = {
    sessionId: string;
    state: string;
    mode: string;
    message: string;
    hardConstraints: AgentDraftItemResponse[];
    softPreferences: AgentDraftItemResponse[];
    errors: string[];
};

export type StartAgentSessionRequest = {
    schedulingPeriodId: string;
};

export type SendAgentMessageRequest = {
    sessionId: string;
    message: string;
};

export type ApproveAgentSessionRequest = {
    sessionId: string;
};

export type ApproveAgentSessionResponse = {
    sessionId: string;
    createdHardConstraints: number;
    createdSoftPreferences: number;
};
