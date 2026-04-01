/**
 * Assignment Editor Modal Component
 * Handles both create and edit modes for assignments
 */

import { useEffect, useState, useMemo } from "react";
import { Modal, Select, Button, Group, Text, Stack } from "@mantine/core";
import { useAssignmentEditorStore } from "@/modules/schedule/src/stores";
import {
    useCreateAssignment,
    useUpdateAssignment,
    useResources,
    useActivities,
} from "@/modules/schedule/src/hooks";
import assignmentResources from "@/modules/schedule/src/pages/scheduling-periods-page/assignment.resources.json";

export function AssignmentEditor() {
    const { isOpen, mode, assignment, slotId, close } = useAssignmentEditorStore();
    const { createAssignment, isLoading: isCreating, error: createError, clearError: clearCreateError } = useCreateAssignment();
    const { updateAssignment, isLoading: isUpdating, error: updateError, clearError: clearUpdateError } = useUpdateAssignment();
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
            newErrors.resourceId = assignmentResources.editor.resourceRequired;
        }
        if (!activityId) {
            newErrors.activityId = assignmentResources.editor.activityRequired;
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
        } else if (mode === "edit" && assignment && resourceId && activityId) {
            success = await updateAssignment(assignment.id, {
                slotId: assignment.slotId,
                resourceId,
                activityId,
            });
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
    const apiError = createError || updateError;
    const title = mode === "create"
        ? assignmentResources.editor.createTitle
        : assignmentResources.editor.editTitle;
    const submitButtonLabel = mode === "create"
        ? assignmentResources.editor.createButton
        : assignmentResources.editor.saveButton;
    let resourcePlaceholder = assignmentResources.editor.resourceSelectPlaceholder;
    if (isLoadingResources) {
        resourcePlaceholder = assignmentResources.editor.resourceLoadingPlaceholder;
    } else if (resourceOptions.length === 0) {
        resourcePlaceholder = assignmentResources.editor.resourceEmptyPlaceholder;
    }

    let activityPlaceholder = assignmentResources.editor.activitySelectPlaceholder;
    if (isLoadingActivities) {
        activityPlaceholder = assignmentResources.editor.activityLoadingPlaceholder;
    } else if (activityOptions.length === 0) {
        activityPlaceholder = assignmentResources.editor.activityEmptyPlaceholder;
    }

    return (
        <Modal opened={isOpen} onClose={handleClose} title={title} centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Select
                        label={assignmentResources.editor.resourceLabel}
                        placeholder={resourcePlaceholder}
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
                        label={assignmentResources.editor.activityLabel}
                        placeholder={activityPlaceholder}
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

                    {apiError && (
                        <Text size="sm" c="var(--mantine-color-error)">
                            {apiError}
                        </Text>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {assignmentResources.editor.cancelButton}
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
