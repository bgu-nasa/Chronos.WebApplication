/**
 * Assignment Panel Component
 * Modal/Drawer showing assignments for a selected slot
 */

import { useEffect, useState } from "react";
import { Modal, Title, Button, Group, Stack, Text, Divider } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { AssignmentTable } from "@/modules/schedule/src/pages/scheduling-periods-page/components/assignment-table";
import { AssignmentActions } from "@/modules/schedule/src/pages/scheduling-periods-page/components/assignment-actions";
import { AssignmentEditor } from "@/modules/schedule/src/pages/scheduling-periods-page/components/assignment-editor";
import { useAssignments, useDeleteAssignment } from "@/modules/schedule/src/hooks/use-assignments";
import { useAssignmentEditorStore } from "@/modules/schedule/src/stores/assignment-editor.store";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import resourcesJson from "@/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json";
import { getWeekdayLabel } from "@/common/weekdays";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json",
    resourcesJson,
);

interface AssignmentPanelProps {
    isOpen: boolean;
    slot: SlotResponse | null;
    onClose: () => void;
}

export function AssignmentPanel({ isOpen, slot, onClose }: Readonly<AssignmentPanelProps>) {
    useLocaleStore((state) => state.language);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);

    const { assignments, isLoading, fetchAssignments, clearAssignments } = useAssignments();
    const { deleteAssignment } = useDeleteAssignment();
    const { openCreate, openEdit } = useAssignmentEditorStore();

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    // Fetch assignments when panel opens with a slot
    useEffect(() => {
        if (isOpen && slot) {
            fetchAssignments(slot.id);
            setSelectedAssignment(null);
        }
    }, [isOpen, slot]);

    // Sync selectedAssignment with updated assignments list after edits
    useEffect(() => {
        if (selectedAssignment) {
            const updatedAssignment = assignments.find((a) => a.id === selectedAssignment.id);
            if (updatedAssignment) {
                // Update the selected assignment with fresh data
                setSelectedAssignment(updatedAssignment);
            } else {
                // Assignment was deleted, clear selection
                setSelectedAssignment(null);
            }
        }
    }, [assignments]);

    // Clear assignments when panel closes
    const handleClose = () => {
        clearAssignments();
        setSelectedAssignment(null);
        onClose();
    };

    // Assignment actions
    const handleCreateClick = () => {
        if (slot) {
            openCreate(slot.id, slot.schedulingPeriodId);
        }
    };

    const handleEditClick = () => {
        if (selectedAssignment && slot) {
            openEdit(selectedAssignment, slot.schedulingPeriodId);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedAssignment) return;

        openConfirmation({
            title: resources.assignmentDeleteConfirmTitle,
            message: resources.assignmentDeleteConfirmMessage,
            onConfirm: async () => {
                const success = await deleteAssignment(selectedAssignment.id);
                if (success) {
                    setSelectedAssignment(null);
                    $app.notifications.showSuccess(
                        notificationResources.successTitle,
                        resources.notifications.assignmentDeleteSuccess,
                    );
                } else {
                    $app.notifications.showError(
                        notificationResources.errorTitle,
                        resources.notifications.assignmentDeleteError,
                    );
                }
            },
        });
    };

    // Format time for display
    const formatTime = (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    };

    const localSlotHeader = slot
        ? (convertSlotUtcToLocal(
            slot.weekday,
            slot.fromTime.split(":").slice(0, 2).join(":"),
            slot.toTime.split(":").slice(0, 2).join(":")
        )[0] ?? {
            weekday: slot.weekday,
            fromTime: slot.fromTime,
            toTime: slot.toTime,
        })
        : null;

    if (!slot) return null;

    const weekdayLabel = localSlotHeader?.weekday
        ? getWeekdayLabel(localSlotHeader.weekday)
        : "";

    const slotHeaderText = resources.assignmentsPanelSlotHeader
        .replace("{weekday}", weekdayLabel)
        .replace("{fromTime}", formatTime(localSlotHeader?.fromTime ?? ""))
        .replace("{toTime}", formatTime(localSlotHeader?.toTime ?? ""));

    return (
        <>
            <Modal
                opened={isOpen}
                onClose={handleClose}
                title={
                    <Stack gap={0}>
                        <Title order={4}>{resources.assignmentsPanelTitle}</Title>
                        <Text size="sm" c="dimmed">
                            {slotHeaderText}
                        </Text>
                    </Stack>
                }
                size="lg"
                centered
            >
                <Divider mb="md" />

                <AssignmentActions
                    selectedAssignment={selectedAssignment}
                    onCreateClick={handleCreateClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />

                <AssignmentTable
                    assignments={assignments}
                    selectedAssignment={selectedAssignment}
                    onSelectionChange={setSelectedAssignment}
                    isLoading={isLoading}
                    slot={slot}
                />

                <Group justify="flex-end" mt="lg">
                    <Button variant="subtle" onClick={handleClose}>
                        {resources.assignmentsPanelCloseButton}
                    </Button>
                </Group>
            </Modal>

            <AssignmentEditor />

            <ConfirmationDialog
                opened={confirmationState.isOpen}
                onClose={closeConfirmation}
                onConfirm={handleConfirm}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={resources.deleteConfirmButton}
                cancelText={resources.deleteCancelButton}
                loading={isConfirming}
            />
        </>
    );
}
