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
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/assignment.resources.json";
import { useLocalization } from "@/infra/service/localization";

interface AssignmentPanelProps {
    isOpen: boolean;
    slot: SlotResponse | null;
    onClose: () => void;
}

export function AssignmentPanel({ isOpen, slot, onClose }: AssignmentPanelProps) {
    const { t } = useLocalization();
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
            openCreate(slot.id);
        }
    };

    const handleEditClick = () => {
        if (selectedAssignment) {
            openEdit(selectedAssignment);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedAssignment) return;

        openConfirmation({
            title: resources.deleteConfirm.title,
            message: resources.deleteConfirm.message,
            onConfirm: async () => {
                const success = await deleteAssignment(selectedAssignment.id);
                if (success) {
                    setSelectedAssignment(null);
                    $app.notifications.showSuccess("Success", "Assignment deleted successfully");
                } else {
                    $app.notifications.showError("Error", "Failed to delete assignment");
                }
            },
        });
    };

    // Format time for display
    const formatTime = (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    };

    if (!slot) return null;

    return (
        <>
            <Modal
                opened={isOpen}
                onClose={handleClose}
                title={
                    <Stack gap={0}>
                        <Title order={4}>{resources.panelTitle}</Title>
                        <Text size="sm" c="dimmed">
                            {t(`weekday.${slot.weekday.toLowerCase()}`, undefined, slot.weekday)} • {formatTime(slot.fromTime)} - {formatTime(slot.toTime)}
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
                />

                <Group justify="flex-end" mt="lg">
                    <Button variant="subtle" onClick={handleClose}>
                        {resources.closeButton}
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
                confirmText={resources.deleteConfirm.confirmButton}
                cancelText={resources.deleteConfirm.cancelButton}
                loading={isConfirming}
            />
        </>
    );
}
