import { useCallback, useEffect, useState } from "react";
import { Container, Divider, Title, Button, Group } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import { slotDataRepository } from "@/modules/schedule/src/data/slot-data-repository";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import { AppealsDataTable } from "./components/appeals-data-table";
import { ViewAppealModal } from "./components/view-appeal-modal";
import resources from "./appeals-page.resources.json";
import styles from "./appeals-page.module.css";

export function AppealsPage() {
    const [appeals, setAppeals] = useState<AppealResponse[]>([]);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [slots, setSlots] = useState<SlotResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState<AppealResponse | null>(null);
    const [viewingAppeal, setViewingAppeal] = useState<AppealResponse | null>(null);

    const { activities } = useActivities();
    const { resources: resourceList } = useResources();

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    const fetchAppeals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await appealDataRepository.getAllAppeals();
            setAppeals(data);

            const assignmentIds = [...new Set(data.map((a) => a.assignmentId))];
            const assignmentResults = await Promise.all(
                assignmentIds.map((id) =>
                    assignmentDataRepository.getAssignment(id).catch(() => null)
                )
            );
            const validAssignments = assignmentResults.filter((a): a is AssignmentResponse => a !== null);
            setAssignments(validAssignments);

            const slotIds = [...new Set(validAssignments.map((a) => a.slotId))];
            const slotResults = await Promise.all(
                slotIds.map((id) =>
                    slotDataRepository.getSlot(id).catch(() => null)
                )
            );
            setSlots(slotResults.filter((s): s is SlotResponse => s !== null));
        } catch (err) {
            $app.logger.error("Failed to fetch appeals:", err);
            $app.notifications.showError("Error", "Failed to fetch appeals");
            setAppeals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            try {
                const data = await appealDataRepository.getAllAppeals();
                if (cancelled) return;
                setAppeals(data);

                const assignmentIds = [...new Set(data.map((a) => a.assignmentId))];
                const assignmentResults = await Promise.all(
                    assignmentIds.map((id) =>
                        assignmentDataRepository.getAssignment(id).catch(() => null)
                    )
                );
                if (cancelled) return;
                const validAssignments = assignmentResults.filter((a): a is AssignmentResponse => a !== null);
                setAssignments(validAssignments);

                const slotIds = [...new Set(validAssignments.map((a) => a.slotId))];
                const slotResults = await Promise.all(
                    slotIds.map((id) =>
                        slotDataRepository.getSlot(id).catch(() => null)
                    )
                );
                if (cancelled) return;
                setSlots(slotResults.filter((s): s is SlotResponse => s !== null));
            } catch (err) {
                if (cancelled) return;
                $app.logger.error("Failed to fetch appeals:", err);
                $app.notifications.showError("Error", "Failed to fetch appeals");
                setAppeals([]);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleDismissClick = () => {
        if (!selectedAppeal) return;

        openConfirmation({
            title: resources.dismissConfirmTitle,
            message: resources.dismissConfirmMessage,
            onConfirm: async () => {
                try {
                    await appealDataRepository.deleteAppeal(selectedAppeal.id);
                    setSelectedAppeal(null);
                    $app.notifications.showSuccess("Success", resources.dismissSuccess);
                    fetchAppeals();
                } catch {
                    $app.notifications.showError("Error", resources.dismissError);
                }
            },
        });
    };

    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    const slotMap = new Map(slots.map((s) => [s.id, s]));
    const activityMap = new Map(activities.map((a) => [a.id, a]));
    const resourceMap = new Map(resourceList.map((r) => [r.id, r]));

    const getAppealDetails = (appeal: AppealResponse) => {
        const assignment = assignmentMap.get(appeal.assignmentId);
        const slot = assignment ? slotMap.get(assignment.slotId) : undefined;
        const activity = assignment ? activityMap.get(assignment.activityId) : undefined;
        const resource = assignment ? resourceMap.get(assignment.resourceId) : undefined;
        return { assignment, slot, activity, resource };
    };

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <div className={styles.headerRow}>
                    <Group>
                        <Button
                            variant="light"
                            onClick={() => selectedAppeal && setViewingAppeal(selectedAppeal)}
                            disabled={!selectedAppeal}
                        >
                            {resources.viewButton}
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            onClick={handleDismissClick}
                            disabled={!selectedAppeal}
                        >
                            {resources.dismissButton}
                        </Button>
                    </Group>
                </div>

                <AppealsDataTable
                    appeals={appeals}
                    assignments={assignments}
                    slots={slots}
                    activities={activities}
                    resourceList={resourceList}
                    selectedAppeal={selectedAppeal}
                    onSelectionChange={setSelectedAppeal}
                    isLoading={isLoading}
                />

                <ViewAppealModal
                    appeal={viewingAppeal}
                    details={viewingAppeal ? getAppealDetails(viewingAppeal) : undefined}
                    onClose={() => setViewingAppeal(null)}
                />

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={resources.dismissConfirmButton}
                    cancelText={resources.dismissCancelButton}
                    loading={isConfirming}
                />
            </div>
        </Container>
    );
}
