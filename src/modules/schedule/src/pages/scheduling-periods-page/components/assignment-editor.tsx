/**
 * Assignment Editor Modal Component
 * Handles both create and edit modes for assignments
 */

import { useEffect, useState, useMemo } from "react";
import { Modal, Select, Button, Group, Stack, NumberInput } from "@mantine/core";
import { useAssignmentEditorStore } from "@/modules/schedule/src/stores";
import {
    useCreateAssignment,
    useUpdateAssignment,
    useResources,
    useActivities,
} from "@/modules/schedule/src/hooks";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);
import assignmentEditorResourcesJson from "./assignment-editor.resources.json";

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/components/assignment-editor.resources.json",
    assignmentEditorResourcesJson,
);

export function AssignmentEditor() {
    const { isOpen, mode, assignment, slotId, schedulingPeriodId, close } = useAssignmentEditorStore();
    const { createAssignment, isLoading: isCreating, clearError: clearCreateError } = useCreateAssignment();
    const { updateAssignment, isLoading: isUpdating, clearError: clearUpdateError } = useUpdateAssignment();
    const { resources: roomResources, isLoading: isLoadingResources } = useResources();
    const { activities, isLoading: isLoadingActivities } = useActivities(schedulingPeriodId ?? undefined);

    const [resourceId, setResourceId] = useState<string | null>(null);
    const [activityId, setActivityId] = useState<string | null>(null);
    const [weekNum, setWeekNum] = useState<number | string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resourceOptions = useMemo(() => {
        return roomResources.map((resource) => ({
            value: resource.id,
            label: `${resource.location} / ${resource.identifier}`,
        }));
    }, [roomResources]);

    const activityOptions = useMemo(() => {
        return activities.map((activity) => ({
            value: activity.id,
            label: activity.displayLabel,
        }));
    }, [activities]);

    useEffect(() => {
        if (isOpen) {
            clearCreateError();
            clearUpdateError();
            setErrors({});

            if (mode === "edit" && assignment) {
                setResourceId(assignment.resourceId);
                setActivityId(assignment.activityId);
                setWeekNum(assignment.weekNum ?? '');
            } else {
                setResourceId(null);
                setActivityId(null);
                setWeekNum('');
            }
        }
    }, [isOpen, mode, assignment, clearCreateError, clearUpdateError]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!resourceId) {
            newErrors.resourceId = resources.validation.resourceRequired;
        }
        if (!activityId) {
            newErrors.activityId = resources.validation.activityRequired;
        }
        if (weekNum !== '' && weekNum !== null && weekNum !== undefined) {
            const parsedWeekNum = Number(weekNum);
            if (parsedWeekNum < 1 || parsedWeekNum > 53) {
                newErrors.weekNum = resources.validation.weekNumRange;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const parsedWeekNum = weekNum === '' ? null : Number(weekNum);
        let success = false;

        if (mode === "create" && slotId && resourceId && activityId) {
            const result = await createAssignment({
                slotId,
                resourceId,
                activityId,
                weekNum: parsedWeekNum,
            });
            success = result !== null;
            if (success) {
                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.createSuccess,
                );
            } else {
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.createError,
                );
            }
        } else if (mode === "edit" && assignment && resourceId && activityId) {
            success = await updateAssignment(assignment.id, {
                slotId: assignment.slotId,
                resourceId,
                activityId,
                weekNum: parsedWeekNum,
            });
            if (success) {
                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.updateSuccess,
                );
            } else {
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.updateError,
                );
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
        setWeekNum('');
        setErrors({});
        clearCreateError();
        clearUpdateError();
    };

    const isLoading = isCreating || isUpdating;
    const title = mode === "create" ? resources.titleCreate : resources.titleEdit;
    const submitButtonLabel = mode === "create" ? resources.submitCreate : resources.submitSave;

    return (
        <Modal opened={isOpen} onClose={handleClose} title={title} centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Select
                        label={resources.labels.resource}
                        placeholder={
                            isLoadingResources
                                ? resources.placeholders.loadingResources
                                : resourceOptions.length === 0
                                    ? resources.placeholders.noResources
                                    : resources.placeholders.selectResource
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
                        label={resources.labels.activity}
                        placeholder={
                            isLoadingActivities
                                ? resources.placeholders.loadingActivities
                                : activityOptions.length === 0
                                    ? resources.placeholders.noActivities
                                    : resources.placeholders.selectActivity
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

                    <NumberInput
                        label={resources.labels.weekNumber}
                        placeholder={resources.placeholders.weekNumber}
                        value={weekNum}
                        onChange={(value) => {
                            setWeekNum(value);
                            setErrors((prev) => {
                                const { weekNum: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.weekNum}
                        min={1}
                        max={53}
                        clampBehavior="none"
                        disabled={isLoading}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {resources.cancel}
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
