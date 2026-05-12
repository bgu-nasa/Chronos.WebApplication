/**
 * Constraint data repository
 * Handles all constraint-related API calls with organization context
 */

import type {
    UserConstraintResponse,
    CreateUserConstraintRequest,
    UpdateUserConstraintRequest,
    UserPreferenceResponse,
    CreateUserPreferenceRequest,
    UpdateUserPreferenceRequest,
    ActivityConstraintResponse,
    CreateActivityConstraintRequest,
    UpdateActivityConstraintRequest,
} from "./constraints.types";

/**
 * Constraint repository class
 * Provides methods for CRUD operations on all constraint types
 */
export class ConstraintDataRepository {
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

    // ========================================================================
    // User Constraints (Hard Constraints)
    // ========================================================================

    /**
     * Fetch all user constraints for the current organization
     */
    async getAllUserConstraints(): Promise<UserConstraintResponse[]> {
        const url = "/api/schedule/constraints/userConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching all user constraints:", { url, headers });

        try {
            const response = await $app.ajax.get<UserConstraintResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched user constraints:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch user constraints failed:", error);
            throw error;
        }
    }

    /**
     * Fetch user constraints by user ID
     */
    async getUserConstraintsByUser(userId: string): Promise<UserConstraintResponse[]> {
        const url = `/api/schedule/constraints/userConstraint/by-user/${userId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching user constraints by user:", { url, userId });

        try {
            const response = await $app.ajax.get<UserConstraintResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched user constraints:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch user constraints by user failed:", error);
            throw error;
        }
    }

    /**
     * Create a new user constraint
     */
    async createUserConstraint(request: CreateUserConstraintRequest): Promise<UserConstraintResponse> {
        const url = "/api/schedule/constraints/userConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Creating user constraint:", { url, headers, request });

        try {
            const response = await $app.ajax.post<UserConstraintResponse>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Create user constraint response:", response);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Create user constraint failed:", error);
            throw error;
        }
    }

    /**
     * Update an existing user constraint
     */
    async updateUserConstraint(
        constraintId: string,
        request: UpdateUserConstraintRequest
    ): Promise<void> {
        const url = `/api/schedule/constraints/userConstraint/${constraintId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Updating user constraint:", { url, headers, request });

        try {
            await $app.ajax.patch<void>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Update user constraint successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Update user constraint failed:", error);
            throw error;
        }
    }

    /**
     * Delete a user constraint
     */
    async deleteUserConstraint(constraintId: string): Promise<void> {
        const url = `/api/schedule/constraints/userConstraint/${constraintId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Deleting user constraint:", { url, headers });

        try {
            await $app.ajax.delete<void>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Delete user constraint successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Delete user constraint failed:", error);
            throw error;
        }
    }

    // ========================================================================
    // User Preferences (Soft Constraints)
    // ========================================================================

    /**
     * Fetch all user preferences for the current organization
     */
    async getAllUserPreferences(): Promise<UserPreferenceResponse[]> {
        const url = "/api/schedule/constraints/preferenceConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching all user preferences:", { url, headers });

        try {
            const response = await $app.ajax.get<UserPreferenceResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched user preferences:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch user preferences failed:", error);
            throw error;
        }
    }

    /**
     * Fetch user preferences by user ID
     */
    async getUserPreferencesByUser(userId: string): Promise<UserPreferenceResponse[]> {
        const url = `/api/schedule/constraints/preferenceConstraint/by-user/${userId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching user preferences by user:", { url, userId });

        try {
            const response = await $app.ajax.get<UserPreferenceResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched user preferences:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch user preferences by user failed:", error);
            throw error;
        }
    }

    /**
     * Create a new user preference
     */
    async createUserPreference(request: CreateUserPreferenceRequest): Promise<UserPreferenceResponse> {
        const url = "/api/schedule/constraints/preferenceConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Creating user preference:", { url, headers, request });

        try {
            const response = await $app.ajax.post<UserPreferenceResponse>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Create user preference response:", response);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Create user preference failed:", error);
            throw error;
        }
    }

    /**
     * Update an existing user preference
     */
    async updateUserPreference(
        userId: string,
        schedulingPeriodId: string,
        key: string,
        request: UpdateUserPreferenceRequest
    ): Promise<void> {
        const url = `/api/schedule/constraints/preferenceConstraint/${userId}/${schedulingPeriodId}/${key}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Updating user preference:", { url, headers, request });

        try {
            await $app.ajax.patch<void>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Update user preference successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Update user preference failed:", error);
            throw error;
        }
    }

    /**
     * Delete a user preference
     */
    async deleteUserPreference(preferenceId: string): Promise<void> {
        const url = `/api/schedule/constraints/preferenceConstraint/${preferenceId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Deleting user preference:", { url, headers });

        try {
            await $app.ajax.delete<void>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Delete user preference successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Delete user preference failed:", error);
            throw error;
        }
    }

    // ========================================================================
    // Activity Constraints
    // ========================================================================

    /**
     * Fetch all activity constraints for the current organization
     */
    async getAllActivityConstraints(): Promise<ActivityConstraintResponse[]> {
        const url = "/api/schedule/constraints/activityConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching all activity constraints:", { url, headers });

        try {
            const response = await $app.ajax.get<ActivityConstraintResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched activity constraints:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch activity constraints failed:", error);
            throw error;
        }
    }

    /**
     * Fetch activity constraints by activity ID
     */
    async getActivityConstraintsByActivity(activityId: string): Promise<ActivityConstraintResponse[]> {
        const url = `/api/schedule/constraints/activityConstraint/by-activity/${activityId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Fetching activity constraints by activity:", { url, activityId });

        try {
            const response = await $app.ajax.get<ActivityConstraintResponse[]>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Fetched activity constraints:", response.length);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Fetch activity constraints by activity failed:", error);
            throw error;
        }
    }

    /**
     * Create a new activity constraint
     */
    async createActivityConstraint(request: CreateActivityConstraintRequest): Promise<ActivityConstraintResponse> {
        const url = "/api/schedule/constraints/activityConstraint";
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Creating activity constraint:", { url, headers, request });

        try {
            const response = await $app.ajax.post<ActivityConstraintResponse>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Create activity constraint response:", response);
            return response;
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Create activity constraint failed:", error);
            throw error;
        }
    }

    /**
     * Update an existing activity constraint
     */
    async updateActivityConstraint(
        constraintId: string,
        request: UpdateActivityConstraintRequest
    ): Promise<void> {
        const url = `/api/schedule/constraints/activityConstraint/${constraintId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Updating activity constraint:", { url, headers, request });

        try {
            await $app.ajax.patch<void>(url, request, { headers });
            $app.logger.info("[ConstraintDataRepository] Update activity constraint successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Update activity constraint failed:", error);
            throw error;
        }
    }

    /**
     * Delete an activity constraint
     */
    async deleteActivityConstraint(constraintId: string): Promise<void> {
        const url = `/api/schedule/constraints/activityConstraint/${constraintId}`;
        const headers = this.getHeaders();

        $app.logger.info("[ConstraintDataRepository] Deleting activity constraint:", { url, headers });

        try {
            await $app.ajax.delete<void>(url, { headers });
            $app.logger.info("[ConstraintDataRepository] Delete activity constraint successful");
        } catch (error) {
            $app.logger.error("[ConstraintDataRepository] Delete activity constraint failed:", error);
            throw error;
        }
    }

}

// Export singleton instance
export const constraintDataRepository = new ConstraintDataRepository();
