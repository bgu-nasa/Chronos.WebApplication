import { useEffect, useState, useMemo } from "react";
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
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import { MyAppealsDataTable } from "./components/my-appeals-data-table";
import { EditAppealModal } from "./components/edit-appeal-modal";
import resourcesJson from "./my-appeals-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/my-appeals-page/my-appeals-page.resources.json",
    resourcesJson,
);
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.fetchError,
            );
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
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.fetchError,
                );
                setAppeals([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [currentUserId]);

    const selectedGroupAppeals = useMemo(() => {
        if (!selectedAppeal || appeals.length === 0 || slots.length === 0) return [];

        const enriched = appeals.map((appeal) => {
            const assignment = assignments.find((a) => a.id === appeal.assignmentId);
            const slot = assignment ? slots.find((s) => s.id === assignment.slotId) : undefined;

            let localWeekday = "—";
            let localFromTime = "—";
            let localToTime = "—";

            if (slot) {
                const fromTime = slot.fromTime.split(":").slice(0, 2).join(":");
                const toTime = slot.toTime.split(":").slice(0, 2).join(":");
                const local = convertSlotUtcToLocal(slot.weekday, fromTime, toTime)[0];
                localWeekday = local.weekday;
                localFromTime = local.fromTime;
                localToTime = local.toTime;
            }

            return {
                raw: appeal,
                assignment,
                localWeekday,
                localFromTime,
                localToTime,
            };
        });

        const byWeek: Record<string, typeof enriched> = {};
        for (const item of enriched) {
            const wKey = item.assignment?.weekNum === null || item.assignment?.weekNum === undefined ? "null" : String(item.assignment.weekNum);
            if (!byWeek[wKey]) byWeek[wKey] = [];
            byWeek[wKey].push(item);
        }

        interface WeeklyGroupedBlock {
            activityId: string;
            resourceId: string;
            localWeekday: string;
            localFromTime: string;
            localToTime: string;
            weekNum: number | null;
            appeals: AppealResponse[];
        }

        const weeklyGroups: WeeklyGroupedBlock[] = [];

        const createBlock = (items: typeof enriched): WeeklyGroupedBlock => {
            const first = items[0];
            const last = items.at(-1)!;
            return {
                activityId: first.assignment?.activityId || "",
                resourceId: first.assignment?.resourceId || "",
                localWeekday: first.localWeekday,
                localFromTime: first.localFromTime,
                localToTime: last.localToTime,
                weekNum: first.assignment?.weekNum ?? null,
                appeals: items.map((i) => i.raw),
            };
        };

        for (const wKey in byWeek) {
            const weekItems = byWeek[wKey];
            const subgroups: Record<string, typeof enriched> = {};
            for (const item of weekItems) {
                if (!item.assignment) continue;
                const key = `${item.assignment.activityId}_${item.assignment.resourceId}_${item.localWeekday}`;
                if (!subgroups[key]) subgroups[key] = [];
                subgroups[key].push(item);
            }

            for (const key in subgroups) {
                const items = subgroups[key];
                items.sort((a, b) => a.localFromTime.localeCompare(b.localFromTime));

                let currentBlock: typeof enriched = [];
                for (const item of items) {
                    if (currentBlock.length === 0) {
                        currentBlock.push(item);
                    } else {
                        const lastItem = currentBlock.at(-1);
                        if (lastItem?.localToTime === item.localFromTime) {
                            currentBlock.push(item);
                        } else {
                            weeklyGroups.push(createBlock(currentBlock));
                            currentBlock = [item];
                        }
                    }
                }
                if (currentBlock.length > 0) {
                    weeklyGroups.push(createBlock(currentBlock));
                }
            }
        }

        const multiWeekGroups: Record<string, WeeklyGroupedBlock[]> = {};
        for (const block of weeklyGroups) {
            const key = `${block.activityId}_${block.resourceId}_${block.localWeekday}_${block.localFromTime}_${block.localToTime}`;
            if (!multiWeekGroups[key]) multiWeekGroups[key] = [];
            multiWeekGroups[key].push(block);
        }

        for (const key in multiWeekGroups) {
            const blocks = multiWeekGroups[key];
            const allAppeals = blocks.flatMap((b) => b.appeals);
            if (allAppeals.some((a) => a.id === selectedAppeal.id)) {
                return allAppeals;
            }
        }

        return [selectedAppeal];
    }, [selectedAppeal, appeals, assignments, slots]);

    const handleDeleteClick = () => {
        if (selectedGroupAppeals.length === 0) return;

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage,
            onConfirm: async () => {
                try {
                    for (const a of selectedGroupAppeals) {
                        await appealDataRepository.deleteAppeal(a.id);
                    }
                    setSelectedAppeal(null);
                    $app.notifications.showSuccess(
                        notificationResources.successTitle,
                        resources.deleteSuccess,
                    );
                    fetchAppeals();
                } catch {
                    $app.notifications.showError(
                        notificationResources.errorTitle,
                        resources.deleteError,
                    );
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
                                    onClick={() => setIsEditModalOpen(true)}
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
                    appeals={isEditModalOpen ? selectedGroupAppeals : []}
                    onClose={() => setIsEditModalOpen(false)}
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

