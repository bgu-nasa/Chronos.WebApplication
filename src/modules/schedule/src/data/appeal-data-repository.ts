import type {
    AppealResponse,
    CreateAppealRequest,
    UpdateAppealRequest,
} from "@/modules/schedule/src/data/appeal.types";

export class AppealDataRepository {
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

    async getAllAppeals(): Promise<AppealResponse[]> {
        const response = await $app.ajax.get<AppealResponse[]>(
            `/api/schedule/scheduling/appeals`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    async getAppeal(appealId: string): Promise<AppealResponse> {
        const response = await $app.ajax.get<AppealResponse>(
            `/api/schedule/scheduling/appeals/${appealId}`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    async getAppealsByUser(userId: string): Promise<AppealResponse[]> {
        const response = await $app.ajax.get<AppealResponse[]>(
            `/api/schedule/scheduling/users/${userId}/appeals`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    async getAppealsByAssignment(assignmentId: string): Promise<AppealResponse[]> {
        const response = await $app.ajax.get<AppealResponse[]>(
            `/api/schedule/scheduling/assignments/${assignmentId}/appeals`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    async createAppeal(request: CreateAppealRequest): Promise<AppealResponse> {
        const response = await $app.ajax.post<AppealResponse>(
            `/api/schedule/scheduling/appeals`,
            request,
            { headers: this.getHeaders() }
        );
        return response;
    }

    async updateAppeal(appealId: string, request: UpdateAppealRequest): Promise<void> {
        await $app.ajax.patch<void>(
            `/api/schedule/scheduling/appeals/${appealId}`,
            request,
            { headers: this.getHeaders() }
        );
    }

    async deleteAppeal(appealId: string): Promise<void> {
        await $app.ajax.delete<void>(
            `/api/schedule/scheduling/appeals/${appealId}`,
            { headers: this.getHeaders() }
        );
    }
}

export const appealDataRepository = new AppealDataRepository();
