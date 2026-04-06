/**
 * Activity data repository for Schedule Module
 * Fetches activities, subjects, and users from APIs for assignment dropdowns
 */

import type {
    ActivityResponse,
    SubjectResponse,
    UserResponse,
} from "@/modules/schedule/src/data/activity.types";

/**
 * Activity repository class
 * Provides methods to fetch activities with enriched data
 */
export class ActivityDataRepository {
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
     * Get first active department ID
     * @throws Error if no departments available
     */
    private getDepartmentId(): string {
        const departments = $app.organization.getActiveDepartments();
        if (!departments || departments.length === 0) {
            throw new Error("No departments available");
        }
        return departments[0].id;
    }

    /**
     * Fetch all activities for the organization
     * @returns Array of activities
     */
    async getAllActivities(): Promise<ActivityResponse[]> {
        const departmentId = this.getDepartmentId();
        const response = await $app.ajax.get<ActivityResponse[]>(
            `/api/department/${departmentId}/resources/subjects/Subject/activities`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Fetch activities for a specific scheduling period
     * @param schedulingPeriodId The ID of the scheduling period
     * @returns Array of activities
     */
    async getActivitiesBySchedulingPeriodAsync(schedulingPeriodId: string): Promise<ActivityResponse[]> {
        const departmentId = this.getDepartmentId();
        const response = await $app.ajax.get<ActivityResponse[]>(
            `/api/department/${departmentId}/resources/subjects/Subject/activities/scheduling-period/${schedulingPeriodId}`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Fetch all subjects for the organization
     * @returns Array of subjects
     */
    async getAllSubjects(): Promise<SubjectResponse[]> {
        const departmentId = this.getDepartmentId();
        const response = await $app.ajax.get<SubjectResponse[]>(
            `/api/department/${departmentId}/resources/subjects/Subject`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Fetch all users for the organization
     * @returns Array of users
     */
    async getAllUsers(): Promise<UserResponse[]> {
        const response = await $app.ajax.get<UserResponse[]>(
            `/api/user`,
            { headers: this.getHeaders() }
        );
        return response;
    }
}

// Export singleton instance
export const activityDataRepository = new ActivityDataRepository();
