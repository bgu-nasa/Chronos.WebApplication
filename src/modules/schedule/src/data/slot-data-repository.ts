/**
 * Slot data repository
 * Handles slot API calls with organization context
 */

import type {
    SlotResponse,
    CreateSlotRequest,
    UpdateSlotRequest,
} from "@/modules/schedule/src/data/slot.types";

/**
 * Slot repository class
 * Provides methods for CRUD operations on slots
 */
export class SlotDataRepository {
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
     * Fetch a single slot by ID
     */
    async getSlot(slotId: string): Promise<SlotResponse> {
        const response = await $app.ajax.get<SlotResponse>(
            `/api/schedule/scheduling/slots/${slotId}`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Fetch all slots for a specific scheduling period
     * @param schedulingPeriodId - The ID of the scheduling period
     * @returns Array of slots
     */
    async getSlots(schedulingPeriodId: string): Promise<SlotResponse[]> {
        const response = await $app.ajax.get<SlotResponse[]>(
            `/api/schedule/scheduling/periods/${schedulingPeriodId}/slots`,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Create a new slot
     * @param request - Slot creation request
     * @returns Created slot details
     */
    async createSlot(request: CreateSlotRequest): Promise<SlotResponse> {
        const response = await $app.ajax.post<SlotResponse>(
            `/api/schedule/scheduling/slots`,
            request,
            { headers: this.getHeaders() }
        );
        return response;
    }

    /**
     * Update an existing slot
     * @param slotId - The ID of the slot to update
     * @param request - Slot update request
     * @returns void (HTTP 204 No Content)
     */
    async updateSlot(
        slotId: string,
        request: UpdateSlotRequest
    ): Promise<void> {
        await $app.ajax.patch<void>(
            `/api/schedule/scheduling/slots/${slotId}`,
            request,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Delete a slot
     * @param slotId - The ID of the slot to delete
     * @returns void (HTTP 204 No Content)
     */
    async deleteSlot(slotId: string): Promise<void> {
        await $app.ajax.delete<void>(
            `/api/schedule/scheduling/slots/${slotId}`,
            { headers: this.getHeaders() }
        );
    }
}

// Export singleton instance
export const slotDataRepository = new SlotDataRepository();
