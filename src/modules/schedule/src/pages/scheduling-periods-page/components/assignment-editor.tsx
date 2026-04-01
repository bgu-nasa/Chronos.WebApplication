/**
 * Assignment Editor Modal Component
 * Handles both create and edit modes for assignments
 */

import { useEffect, useState, useMemo } from "react";
import { Modal, Select, Button, Group, Stack } from "@mantine/core";
import { useAssignmentEditorStore } from "@/modules/schedule/src/stores";
import {
    useCreateAssignment,
    useUpdateAssignment,
    useResources,
    useActivities,
} from "@/modules/schedule/src/hooks";

export function AssignmentEditor() {
    const { isOpen, mode, assignment, slotId, close } = useAssignmentEditorStore();
    const { createAssignment, isLoading: isCreating, clearError: clearCreateError } = useCreateAssignment();
    const { updateAssignment, isLoading: isUpdating, clearError: clearUpdateError } = useUpdateAssignment();
    const { resources, isLoading: isLoadingResources } = useResources();
    const { activities, isLoading: isLoadingActivities } = useActivities();

    const [resourceId, setResourceId] = useState<string | null>(null);
    const [activityId, setActivityId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Transform resources to Select options - show Location / Identifier, value is ID
    const resourceOptions = useMemo(() => {
        return resources.map((resource) => ({
            value: resource.id,
            label: `${resource.location} / ${resource.identifier}`,
        }));
    }, [resources]);

    // Transform activities to Select options - show enriched display, value is ID
    const activityOptions = useMemo(() => {
        return activities.map((activity) => ({
            value: activity.id,
            label: activity.displayLabel,
        }));
    }, [activities]);

    // Reset form when modal opens/closes or assignment changes
    useEffect(() => {
        if (isOpen) {
            clearCreateError();
            clearUpdateError();
            setErrors({});

            if (mode === "edit" && assignment) {
                setResourceId(assignment.resourceId);
                setActivityId(assignment.activityId);
            } else {
                setResourceId(null);
                setActivityId(null);
            }
        }
    }, [isOpen, mode, assignment]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!resourceId) {
            newErrors.resourceId = "Resource is required";
        }
        if (!activityId) {
            newErrors.activityId = "Activity is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        let success = false;

        if (mode === "create" && slotId && resourceId && activityId) {
            const result = await createAssignment({
                slotId,
                resourceId,
                activityId,
            });
            success = result !== null;
            if (success) {
                $app.notifications.showSuccess("Success", "Assignment created successfully");
            } else {
                $app.notifications.showError("Error", "Failed to create assignment");
            }
        } else if (mode === "edit" && assignment && resourceId && activityId) {
            success = await updateAssignment(assignment.id, {
                slotId: assignment.slotId,
                resourceId,
                activityId,
            });
            if (success) {
                $app.notifications.showSuccess("Success", "Assignment updated successfully");
            } else {
                $app.notifications.showError("Error", "Failed to update assignment");
            }
        }

        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        close();
        setResourceId(null);
        setActivityId(null);
        setErrors({});
        clearCreateError();
        clearUpdateError();
    };

    const isLoading = isCreating || isUpdating;
    const title = mode === "create" ? "Add Assignment" : "Edit Assignment";
    const submitButtonLabel = mode === "create" ? "Create" : "Save";

    return (
        <Modal opened={isOpen} onClose={handleClose} title={title} centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Select
                        label="Resource (Location)"
                        placeholder={
                            isLoadingResources
                                ? "Loading resources..."
                                : resourceOptions.length === 0
                                    ? "There are no resources yet"
                                    : "Select a resource"
                        }
                        data={resourceOptions}
                        value={resourceId}
                        onChange={(value) => {
                            setResourceId(value);
                            setErrors((prev) => {
                                const { resourceId: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.resourceId}
                        required
                        disabled={isLoading || isLoadingResources || resourceOptions.length === 0}
                        searchable
                        clearable
                    />

                    <Select
                        label="Activity"
                        placeholder={
                            isLoadingActivities
                                ? "Loading activities..."
                                : activityOptions.length === 0
                                    ? "There are no activities yet"
                                    : "Select an activity"
                        }
                        data={activityOptions}
                        value={activityId}
                        onChange={(value) => {
                            setActivityId(value);
                            setErrors((prev) => {
                                const { activityId: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.activityId}
                        required
                        disabled={isLoading || isLoadingActivities || activityOptions.length === 0}
                        searchable
                        clearable
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            {submitButtonLabel}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
