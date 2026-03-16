/**
 * Assignment data repository
 * Handles assignment API calls with organization context
 */

import type {
    AssignmentResponse,
    CreateAssignmentRequest,
    UpdateAssignmentRequest,
} from "@/modules/schedule/src/data/assignment.types";

/**
 * Assignment repository class
 * Provides methods for CRUD operations on assignments
 */
export class AssignmentDataRepository {
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
     * Fetch all assignments for a specific slot
     * @param slotId - The ID of the slot
     * @returns Array of assignments
     */
    async getAssignmentsBySlot(slotId: string): Promise<AssignmentResponse[]> {
        const response = await $app.ajax.get<AssignmentResponse[]>(
            `/api/schedule/scheduling/slots/${slotId}/assignments`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Fetch all assignments
     * @returns Array of all assignments
     */
    async getAllAssignments(): Promise<AssignmentResponse[]> {
        const response = await $app.ajax.get<AssignmentResponse[]>(
            `/api/schedule/scheduling/assignments`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Get a single assignment by ID
     * @param assignmentId - The ID of the assignment
     * @returns Assignment details
     */
    async getAssignment(assignmentId: string): Promise<AssignmentResponse> {
        const response = await $app.ajax.get<AssignmentResponse>(
            `/api/schedule/scheduling/assignments/${assignmentId}`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Create a new assignment
     * @param request - Assignment creation request
     * @returns Created assignment details
     */
    async createAssignment(request: CreateAssignmentRequest): Promise<AssignmentResponse> {
        const response = await $app.ajax.post<AssignmentResponse>(
            `/api/schedule/scheduling/assignments`,
            request,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Update an existing assignment
     * @param assignmentId - The ID of the assignment to update
     * @param request - Assignment update request
     * @returns void (HTTP 204 No Content)
     */
    async updateAssignment(
        assignmentId: string,
        request: UpdateAssignmentRequest
    ): Promise<void> {
        await $app.ajax.patch<void>(
            `/api/schedule/scheduling/assignments/${assignmentId}`,
            request,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Delete an assignment
     * @param assignmentId - The ID of the assignment to delete
     * @returns void (HTTP 204 No Content)
     */
    async deleteAssignment(assignmentId: string): Promise<void> {
        await $app.ajax.delete<void>(
            `/api/schedule/scheduling/assignments/${assignmentId}`,
            { headers: this.getHeaders() }
        );
    }
}

// Export singleton instance
export const assignmentDataRepository = new AssignmentDataRepository();
