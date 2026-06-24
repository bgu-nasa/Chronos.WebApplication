import { useCallback, useEffect, useState, useMemo } from "react";
import { Container, Divider, Title, Button, Group } from "@mantine/core";
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
import { formatWeeksRange } from "@/modules/schedule/src/pages/assignments-page/components/assignments-data-table";
import { AppealsDataTable } from "./components/appeals-data-table";
import { ViewAppealModal } from "./components/view-appeal-modal";
import resourcesJson from "./appeals-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/appeals-page/appeals-page.resources.json",
    resourcesJson,
);
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
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.fetchError,
            );
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
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.fetchError,
                );
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

    const handleDismissClick = () => {
        if (selectedGroupAppeals.length === 0) return;

        openConfirmation({
            title: resources.dismissConfirmTitle,
            message: resources.dismissConfirmMessage,
            onConfirm: async () => {
                try {
                    for (const a of selectedGroupAppeals) {
                        await appealDataRepository.deleteAppeal(a.id);
                    }
                    setSelectedAppeal(null);
                    $app.notifications.showSuccess(
                        notificationResources.successTitle,
                        resources.dismissSuccess,
                    );
                    fetchAppeals();
                } catch {
                    $app.notifications.showError(
                        notificationResources.errorTitle,
                        resources.dismissError,
                    );
                }
            },
        });
    };

    const assignmentMap = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
    const activityMap = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
    const resourceMap = useMemo(() => new Map(resourceList.map((r) => [r.id, r])), [resourceList]);

    const getAppealDetails = (appeal: AppealResponse) => {
        const assignment = assignmentMap.get(appeal.assignmentId);
        const slot = assignment ? slotMap.get(assignment.slotId) : undefined;
        const activity = assignment ? activityMap.get(assignment.activityId) : undefined;
        const resource = assignment ? resourceMap.get(assignment.resourceId) : undefined;

        // Calculate weeks range for the group containing this appeal
        const enriched = appeals.map((app) => {
            const assign = assignments.find((a) => a.id === app.assignmentId);
            const sl = assign ? slots.find((s) => s.id === assign.slotId) : undefined;

            let localWeekday = "—";
            let localFromTime = "—";
            let localToTime = "—";

            if (sl) {
                const fromTime = sl.fromTime.split(":").slice(0, 2).join(":");
                const toTime = sl.toTime.split(":").slice(0, 2).join(":");
                const local = convertSlotUtcToLocal(sl.weekday, fromTime, toTime)[0];
                localWeekday = local.weekday;
                localFromTime = local.fromTime;
                localToTime = local.toTime;
            }

            return {
                raw: app,
                assignment: assign,
                localWeekday,
                localFromTime,
                localToTime,
            };
        });

        // Replicate grouping to get group assignments
        const targetAssignments: AssignmentResponse[] = [];
        if (assignment) {
            const currentItem = enriched.find((e) => e.raw.id === appeal.id);
            if (currentItem) {
                const groupItems = enriched.filter((e) => 
                    e.assignment?.activityId === assignment.activityId &&
                    e.assignment?.resourceId === assignment.resourceId &&
                    e.localWeekday === currentItem.localWeekday &&
                    e.localFromTime === currentItem.localFromTime &&
                    e.localToTime === currentItem.localToTime
                );
                for (const item of groupItems) {
                    if (item.assignment) {
                        targetAssignments.push(item.assignment);
                    }
                }
            }
        }

        const weeksList = targetAssignments.map((as) => as.weekNum);
        let weekDisplay = "—";
        if (weeksList.length > 0) {
            if (!weeksList.includes(null)) {
                weekDisplay = formatWeeksRange(weeksList, "—");
            }
        }

        return { assignment, slot, activity, resource, weekDisplay };
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

