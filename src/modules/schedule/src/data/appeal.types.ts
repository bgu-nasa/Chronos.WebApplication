export interface AppealResponse {
    id: string;
    organizationId: string;
    assignmentId: string;
    title: string;
    description: string;
}

export interface CreateAppealRequest {
    assignmentId: string;
    title: string;
    description: string;
}

export interface UpdateAppealRequest {
    title?: string;
    description?: string;
}
