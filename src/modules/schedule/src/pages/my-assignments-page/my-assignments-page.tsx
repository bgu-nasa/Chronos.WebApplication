import { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Divider, Title, Select, Button, Group } from "@mantine/core";
import { $app } from "@/infra/service";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks/use-scheduling-periods";
import { useSlots } from "@/modules/schedule/src/hooks/use-slots";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";

import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { AssignmentsDataTable } from "@/modules/schedule/src/pages/assignments-page/components/assignments-data-table";
import { CreateAppealModal } from "./components/create-appeal-modal";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import resourcesJson from "./my-assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/my-assignments-page/my-assignments-page.resources.json",
    resourcesJson,
);
import styles from "./my-assignments-page.module.css";

export function MyAssignmentsPage() {
    const currentUserId = $app.organization.getOrganization()?.userRoles?.[0]?.userId ?? null;

    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);

    const [filterResourceId, setFilterResourceId] = useState<string | null>(null);
    const [filterWeekNum, setFilterWeekNum] = useState<number | null>(null);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();
    const { slots, fetchSlots } = useSlots();
    const { activities } = useActivities(selectedPeriodId ?? undefined);
    const { resources: resourceList } = useResources();

    useEffect(() => {
        fetchSchedulingPeriods();
    }, []);

    const sortedPeriods = useMemo(() => {
        return [...schedulingPeriods].sort(
            (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );
    }, [schedulingPeriods]);

    const currentPeriod = useMemo(
        () => schedulingPeriods.find((p) => p.id === selectedPeriodId),
        [schedulingPeriods, selectedPeriodId]
    );

    useEffect(() => {
        if (sortedPeriods.length > 0 && !selectedPeriodId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const closestActive = sortedPeriods.find((p) => {
                const toDate = new Date(p.toDate);
                toDate.setHours(0, 0, 0, 0);
                return toDate >= today;
            });

            if (closestActive) {
                setSelectedPeriodId(closestActive.id);
            } else {
                setSelectedPeriodId(sortedPeriods.at(-1)!.id);
            }
        }
    }, [sortedPeriods]);

    const periodOptions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return sortedPeriods.map((p) => {
            const toDate = new Date(p.toDate);
            toDate.setHours(0, 0, 0, 0);
            const isEnded = toDate < today;

            return {
                value: p.id,
                label: isEnded ? `${p.name} (ended)` : p.name,
            };
        });
    }, [sortedPeriods]);

    const resourceFilterOptions = useMemo(() => {
        return resourceList.map((r) => ({
            value: r.id,
            label: `${r.location} / ${r.identifier}`,
        }));
    }, [resourceList]);

    const weekNumFilterOptions = useMemo(() => {
        const period = sortedPeriods.find((p) => p.id === selectedPeriodId);
        if (!period) return [];

        const start = new Date(period.fromDate);
        const end = new Date(period.toDate);
        const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
        const totalWeeks = Math.ceil(diffDays / 7);

        return Array.from({ length: totalWeeks }, (_, i) => ({
            value: String(i + 1),
            label: String(i + 1),
        }));
    }, [selectedPeriodId, sortedPeriods]);

    const filteredAssignments = useMemo(() => {
        if (filterWeekNum === null) return assignments;
        return assignments.filter((a) => a.weekNum === filterWeekNum || a.weekNum == null);
    }, [assignments, filterWeekNum]);

    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
    const activityMap = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
    const resourceMap = useMemo(
        () => new Map(resourceList.map((r) => [r.id, `${r.location} / ${r.identifier}`])),
        [resourceList]
    );

    const selectedGroup = useMemo(() => {
        if (!selectedAssignment || assignments.length === 0 || slots.length === 0) return null;

        const enriched = assignments.map((a) => {
            const slot = slotMap.get(a.slotId);
            const activity = activityMap.get(a.activityId);
            const resourceDisplay = resourceMap.get(a.resourceId) || a.resourceId;
            const activityDisplay = activity?.displayLabel || a.activityId;

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
                raw: a,
                localWeekday,
                localFromTime,
                localToTime,
                activityDisplay,
                resourceDisplay,
            };
        });

        const byWeek: Record<string, typeof enriched> = {};
        for (const item of enriched) {
            const wKey = item.raw.weekNum === null ? "null" : String(item.raw.weekNum);
            if (!byWeek[wKey]) byWeek[wKey] = [];
            byWeek[wKey].push(item);
        }

        interface WeeklyBlock {
            activityId: string;
            resourceId: string;
            localWeekday: string;
            localFromTime: string;
            localToTime: string;
            weekNum: number | null;
            assignments: AssignmentResponse[];
        }
        const weeklyGroups: WeeklyBlock[] = [];

        const createBlock = (items: typeof enriched): WeeklyBlock => {
            const first = items[0];
            const last = items.at(-1)!;
            return {
                activityId: first.raw.activityId,
                resourceId: first.raw.resourceId,
                localWeekday: first.localWeekday,
                localFromTime: first.localFromTime,
                localToTime: last.localToTime,
                weekNum: first.raw.weekNum,
                assignments: items.map((i) => i.raw),
            };
        };

        for (const wKey in byWeek) {
            const weekItems = byWeek[wKey];
            const subgroups: Record<string, typeof enriched> = {};
            for (const item of weekItems) {
                const key = `${item.raw.activityId}_${item.raw.resourceId}_${item.localWeekday}`;
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

        const multiWeekGroups: Record<string, WeeklyBlock[]> = {};
        for (const block of weeklyGroups) {
            const key = `${block.activityId}_${block.resourceId}_${block.localWeekday}_${block.localFromTime}_${block.localToTime}`;
            if (!multiWeekGroups[key]) multiWeekGroups[key] = [];
            multiWeekGroups[key].push(block);
        }

        for (const key in multiWeekGroups) {
            const blocks = multiWeekGroups[key];
            const allAssignments = blocks.flatMap((b) => b.assignments);
            if (allAssignments.some((a) => a.id === selectedAssignment.id)) {
                blocks.sort((a, b) => {
                    if (a.weekNum === null) return -1;
                    if (b.weekNum === null) return 1;
                    return a.weekNum - b.weekNum;
                });
                const weeksList = blocks.map((b) => b.weekNum);
                const firstBlock = blocks[0];
                return {
                    weeks: weeksList,
                    assignments: allAssignments,
                    localWeekday: firstBlock?.localWeekday || "—",
                };
            }
        }

        return null;
    }, [selectedAssignment, assignments, slots, slotMap, activityMap, resourceMap]);

    const fetchAssignments = useCallback(async (
        periodId: string,
        userId: string | null,
        resourceId?: string | null,
    ) => {
        setIsLoadingAssignments(true);
        try {
            const data = await assignmentDataRepository.getAllAssignments({
                schedulingPeriodId: periodId,
                assignedUserId: userId || undefined,
                resourceId: resourceId || undefined,
            });
            setAssignments(data);
        } catch (err) {
            $app.logger.error("Failed to fetch assignments:", err);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.fetchError,
            );
            setAssignments([]);
        } finally {
            setIsLoadingAssignments(false);
        }
    }, []);

    useEffect(() => {
        if (selectedPeriodId) {
            fetchAssignments(selectedPeriodId, currentUserId, filterResourceId);
            fetchSlots(selectedPeriodId);
            setSelectedAssignment(null);
        }
    }, [selectedPeriodId, currentUserId, filterResourceId]);

    const handlePeriodChange = (value: string | null) => {
        setSelectedPeriodId(value);
        setSelectedAssignment(null);
        setFilterWeekNum(null);
    };

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <div className={styles.headerRow}>
                    <div className={styles.periodSelect}>
                        <Select
                            label={resources.schedulingPeriodLabel}
                            placeholder={resources.schedulingPeriodPlaceholder}
                            data={periodOptions}
                            value={selectedPeriodId}
                            onChange={handlePeriodChange}
                            searchable
                            nothingFoundMessage={resources.noPeriodsMessage}
                        />
                    </div>

                    <Group>
                        <Button
                            variant="light"
                            onClick={() => setIsAppealModalOpen(true)}
                            disabled={!selectedAssignment}
                        >
                            {resources.appealButton}
                        </Button>
                    </Group>
                </div>

                {selectedPeriodId && (
                    <div className={styles.filtersRow}>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.resourceFilterLabel}
                                placeholder={resources.resourceFilterPlaceholder}
                                data={resourceFilterOptions}
                                value={filterResourceId}
                                onChange={setFilterResourceId}
                                searchable
                                clearable
                            />
                        </div>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.weekNumFilterLabel}
                                placeholder={resources.weekNumFilterPlaceholder}
                                data={weekNumFilterOptions}
                                value={filterWeekNum === null ? null : String(filterWeekNum)}
                                onChange={(v) => setFilterWeekNum(v === null ? null : Number(v))}
                                searchable
                                clearable
                            />
                        </div>
                    </div>
                )}

                {selectedPeriodId && (
                    <AssignmentsDataTable
                        assignments={filteredAssignments}
                        slots={slots}
                        activities={activities}
                        resourceList={resourceList}
                        selectedAssignment={selectedAssignment}
                        onSelectionChange={setSelectedAssignment}
                        isLoading={isLoadingAssignments}
                    />
                )}

                <CreateAppealModal
                    opened={isAppealModalOpen}
                    onClose={() => setIsAppealModalOpen(false)}
                    selectedGroup={selectedGroup}
                    fromDate={currentPeriod?.fromDate}
                    toDate={currentPeriod?.toDate}
                    onCreated={() => {
                        $app.notifications.showSuccess(
                            notificationResources.successTitle,
                            resources.notifications.appealSuccess,
                        );
                        setSelectedAssignment(null);
                        if (selectedPeriodId) {
                            fetchAssignments(selectedPeriodId, currentUserId, filterResourceId);
                        }
                    }}
                />
            </div>
        </Container>
    );
}
