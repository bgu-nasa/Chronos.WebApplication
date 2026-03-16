/**
 * Scheduling Period data repository
 * Handles scheduling period API calls with organization context
 */

import type {
    SchedulingPeriodResponse,
    CreateSchedulingPeriodRequest,
    UpdateSchedulingPeriodRequest,
} from "@/modules/schedule/src/data/scheduling-period.types";

/**
 * Scheduling Period repository class
 * Provides methods for CRUD operations on scheduling periods
 */
export class SchedulingPeriodDataRepository {
    /**
     * Get organization ID from the current organization context
     * @throws Error if no organization is loaded
     */
    private getOrganizationId(): string {
        const organization = $app.organization.getOrganization();
        if (!organization) {
            throw new Error("No organization context available");
        }
        return organization.id;
    }

    /**
     * Get headers with organization ID
     */
    private getHeaders() {
        return {
            "x-org-id": this.getOrganizationId(),
        };
    }

    /**
     * Fetch all scheduling periods for the current organization
     * @returns Array of scheduling periods
     */
    async getAllSchedulingPeriods(): Promise<SchedulingPeriodResponse[]> {
        const response = await $app.ajax.get<SchedulingPeriodResponse[]>(
            "/api/schedule/scheduling/periods",
            { headers: this.getHeaders() }
        );
        return response;
    }



    /**
     * Fetch a single scheduling period by ID
     * @param schedulingPeriodId - The ID of the scheduling period to fetch
     * @returns Scheduling period details
     */
    async getSchedulingPeriodById(schedulingPeriodId: string): Promise<SchedulingPeriodResponse> {
        const response = await $app.ajax.get<SchedulingPeriodResponse>(
            `/api/schedule/scheduling/periods/${schedulingPeriodId}`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Create a new scheduling period
     * @param request - Scheduling period creation request
     * @returns Created scheduling period details
     */
    async createSchedulingPeriod(
        request: CreateSchedulingPeriodRequest
    ): Promise<SchedulingPeriodResponse> {
        const response = await $app.ajax.post<SchedulingPeriodResponse>(
            "/api/schedule/scheduling/periods",
            request,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Update an existing scheduling period
     * @param schedulingPeriodId - The ID of the scheduling period to update
     * @param request - Scheduling period update request
     * @returns void (HTTP 204 No Content)
     */
    async updateSchedulingPeriod(
        schedulingPeriodId: string,
        request: UpdateSchedulingPeriodRequest
    ): Promise<void> {
        await $app.ajax.patch<void>(
            `/api/schedule/scheduling/periods/${schedulingPeriodId}`,
            request,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Delete a scheduling period
     * @param schedulingPeriodId - The ID of the scheduling period to delete
     * @returns void (HTTP 204 No Content)
     */
    async deleteSchedulingPeriod(schedulingPeriodId: string): Promise<void> {
        await $app.ajax.delete<void>(
            `/api/schedule/scheduling/periods/${schedulingPeriodId}`,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Trigger batch scheduling for a scheduling period
     * @param schedulingPeriodId - The ID of the scheduling period to schedule
     * @returns Response with success message
     */
    async triggerBatchScheduling(schedulingPeriodId: string): Promise<{ message: string }> {
        const response = await $app.ajax.post<{ message: string }>(
            `/api/schedule/scheduling/periods/${schedulingPeriodId}/batch-schedule`,
            {},
            { headers: this.getHeaders() }
        );
        return response;
    }
}

// Export singleton instance
export const schedulingPeriodDataRepository = new SchedulingPeriodDataRepository();
