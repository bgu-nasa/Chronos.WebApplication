import { useEffect, useState } from "react";
import { Container, Divider, Title, Button, Group, Text, Stack } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { $app } from "@/infra/service";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import { slotDataRepository } from "@/modules/schedule/src/data/slot-data-repository";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import { MyAppealsDataTable } from "./components/my-appeals-data-table";
import { EditAppealModal } from "./components/edit-appeal-modal";
import resources from "./my-appeals-page.resources.json";
import styles from "./my-appeals-page.module.css";

async function loadUserAppeals(userId: string) {
    const appeals = await appealDataRepository.getAppealsByUser(userId);

    const assignmentIds = [...new Set(appeals.map((a) => a.assignmentId))];
    const assignmentResults = await Promise.all(
        assignmentIds.map((id) =>
            assignmentDataRepository.getAssignment(id).catch(() => null)
        )
    );
    const assignments = assignmentResults.filter((a): a is AssignmentResponse => a !== null);

    const slotIds = [...new Set(assignments.map((a) => a.slotId))];
    const slotResults = await Promise.all(
        slotIds.map((id) =>
            slotDataRepository.getSlot(id).catch(() => null)
        )
    );
    const slots = slotResults.filter((s): s is SlotResponse => s !== null);

    return { appeals, assignments, slots };
}

export function MyAppealsPage() {
    const currentUserId = $app.organization.getOrganization()?.userRoles?.[0]?.userId ?? null;

    const [appeals, setAppeals] = useState<AppealResponse[]>([]);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [slots, setSlots] = useState<SlotResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppeal, setSelectedAppeal] = useState<AppealResponse | null>(null);
    const [editingAppeal, setEditingAppeal] = useState<AppealResponse | null>(null);

    const { activities } = useActivities();
    const { resources: resourceList } = useResources();

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    const fetchAppeals = async () => {
        if (!currentUserId) return;
        setIsLoading(true);
        try {
            const data = await loadUserAppeals(currentUserId);
            setAppeals(data.appeals);
            setAssignments(data.assignments);
            setSlots(data.slots);
        } catch (err) {
            $app.logger.error("Failed to fetch appeals:", err);
            $app.notifications.showError("Error", "Failed to fetch appeals");
            setAppeals([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUserId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            try {
                const data = await loadUserAppeals(currentUserId);
                if (cancelled) return;
                setAppeals(data.appeals);
                setAssignments(data.assignments);
                setSlots(data.slots);
            } catch (err) {
                if (cancelled) return;
                $app.logger.error("Failed to fetch appeals:", err);
                $app.notifications.showError("Error", "Failed to fetch appeals");
                setAppeals([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [currentUserId]);

    const handleDeleteClick = () => {
        if (!selectedAppeal) return;

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage,
            onConfirm: async () => {
                try {
                    await appealDataRepository.deleteAppeal(selectedAppeal.id);
                    setSelectedAppeal(null);
                    $app.notifications.showSuccess("Success", resources.deleteSuccess);
                    fetchAppeals();
                } catch {
                    $app.notifications.showError("Error", resources.deleteError);
                }
            },
        });
    };

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                {!isLoading && appeals.length === 0 ? (
                    <Stack align="center" justify="center" py="xl" gap="sm">
                        <Text size="xl" c="dimmed">
                            {resources.emptyStateTitle}
                        </Text>
                        <Text size="sm" c="dimmed">
                            {resources.emptyStateMessage}
                        </Text>
                    </Stack>
                ) : (
                    <>
                        <div className={styles.headerRow}>
                            <Group>
                                <Button
                                    variant="light"
                                    onClick={() => selectedAppeal && setEditingAppeal(selectedAppeal)}
                                    disabled={!selectedAppeal}
                                >
                                    {resources.editButton}
                                </Button>
                                <Button
                                    variant="light"
                                    color="red"
                                    onClick={handleDeleteClick}
                                    disabled={!selectedAppeal}
                                >
                                    {resources.deleteButton}
                                </Button>
                            </Group>
                        </div>

                        <MyAppealsDataTable
                            appeals={appeals}
                            assignments={assignments}
                            slots={slots}
                            activities={activities}
                            resourceList={resourceList}
                            selectedAppeal={selectedAppeal}
                            onSelectionChange={setSelectedAppeal}
                            isLoading={isLoading}
                        />
                    </>
                )}

                <EditAppealModal
                    appeal={editingAppeal}
                    onClose={() => setEditingAppeal(null)}
                    onUpdated={() => {
                        setSelectedAppeal(null);
                        fetchAppeals();
                    }}
                />

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
            </div>
        </Container>
    );
}
