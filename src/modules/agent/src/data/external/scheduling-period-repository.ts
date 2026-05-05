import type { SchedulingPeriod } from "./scheduling-period.types";

export class SchedulingPeriodRepository {
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

    async getAll(): Promise<SchedulingPeriod[]> {
        return $app.ajax.get<SchedulingPeriod[]>(
            "/api/schedule/scheduling/periods",
            { headers: this.getHeaders() },
        );
    }
}

export const schedulingPeriodRepository = new SchedulingPeriodRepository();
