import { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Divider, Title, Select, Button, Group, Modal, Radio, Stack, Text } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks/use-scheduling-periods";
import { useSlots } from "@/modules/schedule/src/hooks/use-slots";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import { activityDataRepository } from "@/modules/schedule/src/data/activity-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { UserResponse } from "@/modules/schedule/src/data/activity.types";
import type { SchedulingPeriodResponse } from "@/modules/schedule/src/data/scheduling-period.types";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import { AssignmentsDataTable, formatWeeksRange } from "./components/assignments-data-table";
import { getWeekdayLabel } from "@/common/weekdays";
import { AddAssignmentModal } from "./components/add-assignment-modal";
import resourcesJson from "./assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/assignments-page/assignments-page.resources.json",
    resourcesJson,
);
import styles from "./assignments-page.module.css";


export function AssignmentsPage() {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAssignments, setEditingAssignments] = useState<AssignmentResponse[] | null>(null);
    const [isAllWeeksMode, setIsAllWeeksMode] = useState(false);

    const [isEditMultiWeekModalOpen, setIsEditMultiWeekModalOpen] = useState(false);
    const [isDeleteMultiWeekModalOpen, setIsDeleteMultiWeekModalOpen] = useState(false);
    const [multiWeekActionOption, setMultiWeekActionOption] = useState<"all" | "single">("all");
    const [selectedActionWeekNum, setSelectedActionWeekNum] = useState<string | null>(null);

    const [filterUserId, setFilterUserId] = useState<string | null>(null);
    const [filterActivityId, setFilterActivityId] = useState<string | null>(null);
    const [filterResourceId, setFilterResourceId] = useState<string | null>(null);
    const [filterWeekNum, setFilterWeekNum] = useState<number | null>(null);
    const [users, setUsers] = useState<UserResponse[]>([]);

    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();
    const { slots, fetchSlots } = useSlots();
    const { activities } = useActivities(selectedPeriodId ?? undefined);
    const { resources: resourceList } = useResources();

    const currentPeriod = useMemo(
        () => schedulingPeriods.find((p) => p.id === selectedPeriodId),
        [schedulingPeriods, selectedPeriodId]
    );

    const getAssignmentDateString = useCallback((fromDateStr: string | undefined, weekNum: number | null, weekdayName: string): string => {
        if (!fromDateStr || weekNum === null) return "";
        
        const match = fromDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        let start: Date;
        if (match) {
            start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        } else {
            start = new Date(fromDateStr);
        }
        
        const startDayIndex = start.getDay();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const normalized = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1).toLowerCase();
        const targetDayIndex = weekdays.indexOf(normalized);
        if (targetDayIndex === -1) return "";

        const dayOffset = (targetDayIndex - startDayIndex + 7) % 7;
        const actualDate = new Date(start);
        actualDate.setDate(start.getDate() + (weekNum - 1) * 7 + dayOffset);

        const day = String(actualDate.getDate()).padStart(2, '0');
        const month = String(actualDate.getMonth() + 1).padStart(2, '0');
        const year = actualDate.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);

    const selectedGroup = useMemo(() => {
        if (!selectedAssignment || assignments.length === 0 || slots.length === 0) return null;

        // Group assignments the exact same way as in the DataTable
        const enriched = assignments.map((a) => {
            const slot = slotMap.get(a.slotId);
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
            return { raw: a, localWeekday, localFromTime, localToTime };
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
                const dayDisplay = firstBlock && firstBlock.localWeekday !== "—" ? getWeekdayLabel(firstBlock.localWeekday) : "—";
                const timeDisplay =
                    firstBlock && firstBlock.localFromTime !== "—" && firstBlock.localToTime !== "—"
                        ? `${firstBlock.localFromTime} - ${firstBlock.localToTime}`
                        : "—";
                return {
                    weeks: weeksList,
                    assignments: allAssignments,
                    localWeekday: firstBlock?.localWeekday || "—",
                    day: dayDisplay,
                    time: timeDisplay,
                };
            }
        }

        return null;
    }, [selectedAssignment, assignments, slots, slotMap]);

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    useEffect(() => {
        fetchSchedulingPeriods();
        activityDataRepository.getAllUsers().then(setUsers).catch(() => {});
    }, []);

    const sortedPeriods = useMemo(() => {
        return [...schedulingPeriods].sort(
            (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );
    }, [schedulingPeriods]);

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

    const userOptions = useMemo(() => {
        return users.map((u) => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }, [users]);

    const activityFilterOptions = useMemo(() => {
        return activities.map((a) => ({
            value: a.id,
            label: a.displayLabel,
        }));
    }, [activities]);

    const resourceFilterOptions = useMemo(() => {
        return resourceList.map((r) => ({
            value: r.id,
            label: `${r.location} / ${r.identifier}`,
        }));
    }, [resourceList]);

    const weekNumFilterOptions = useMemo(() => {
        const period = sortedPeriods.find((p: SchedulingPeriodResponse) => p.id === selectedPeriodId);
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

    const fetchAssignments = useCallback(async (
        periodId: string,
        userId?: string | null,
        activityId?: string | null,
        resourceId?: string | null,
    ) => {
        setIsLoadingAssignments(true);
        try {
            const data = await assignmentDataRepository.getAllAssignments({
                schedulingPeriodId: periodId,
                assignedUserId: userId || undefined,
                activityId: activityId || undefined,
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
            fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
            fetchSlots(selectedPeriodId);
            setSelectedAssignment(null);
        }
    }, [selectedPeriodId, filterUserId, filterActivityId, filterResourceId]);

    const handlePeriodChange = (value: string | null) => {
        setSelectedPeriodId(value);
        setSelectedAssignment(null);
        setFilterActivityId(null);
        setFilterWeekNum(null);
    };

    const handleAddClick = () => {
        setEditingAssignments(null);
        setIsAllWeeksMode(false);
        setIsAddModalOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedGroup) return;

        if (selectedGroup.weeks.length <= 1) {
            setEditingAssignments(selectedGroup.assignments);
            setIsAllWeeksMode(false);
            setIsAddModalOpen(true);
        } else {
            setMultiWeekActionOption("all");
            setSelectedActionWeekNum(selectedGroup.weeks[0] === null ? null : String(selectedGroup.weeks[0]));
            setIsEditMultiWeekModalOpen(true);
        }
    };

    const handleConfirmEditMultiWeek = () => {
        if (!selectedGroup) return;
        setIsEditMultiWeekModalOpen(false);

        if (multiWeekActionOption === "all") {
            setEditingAssignments(selectedGroup.assignments);
            setIsAllWeeksMode(true);
            setIsAddModalOpen(true);
        } else {
            const selectedWeekVal = selectedActionWeekNum === "null" || selectedActionWeekNum === null ? null : Number(selectedActionWeekNum);
            const filtered = selectedGroup.assignments.filter((a) => a.weekNum === selectedWeekVal);
            setEditingAssignments(filtered);
            setIsAllWeeksMode(false);
            setIsAddModalOpen(true);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedGroup) return;

        if (selectedGroup.weeks.length <= 1) {
            openConfirmation({
                title: resources.deleteConfirmTitle,
                message: resources.deleteConfirmMessage
                    .replace("{day}", selectedGroup.day)
                    .replace("{time}", selectedGroup.time),
                onConfirm: async () => {
                    try {
                        await Promise.all(
                            selectedGroup.assignments.map((a) =>
                                assignmentDataRepository.deleteAssignment(a.id)
                            )
                        );
                        setSelectedAssignment(null);
                        $app.notifications.showSuccess(
                            notificationResources.successTitle,
                            resources.notifications.deleteSuccess,
                        );
                        if (selectedPeriodId) {
                            fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
                        }
                    } catch {
                        $app.notifications.showError(
                            notificationResources.errorTitle,
                            resources.notifications.deleteError,
                        );
                    }
                },
            });
        } else {
            setMultiWeekActionOption("all");
            setSelectedActionWeekNum(selectedGroup.weeks[0] === null ? null : String(selectedGroup.weeks[0]));
            setIsDeleteMultiWeekModalOpen(true);
        }
    };

    const handleConfirmDeleteMultiWeek = async () => {
        if (!selectedGroup) return;
        setIsDeleteMultiWeekModalOpen(false);

        let targets = selectedGroup.assignments;
        if (multiWeekActionOption === "single") {
            const selectedWeekVal = selectedActionWeekNum === "null" || selectedActionWeekNum === null ? null : Number(selectedActionWeekNum);
            targets = selectedGroup.assignments.filter((a) => a.weekNum === selectedWeekVal);
        }

        try {
            await Promise.all(targets.map((a) => assignmentDataRepository.deleteAssignment(a.id)));
            setSelectedAssignment(null);
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.deleteSuccess,
            );
            if (selectedPeriodId) {
                fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
            }
        } catch {
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.deleteError,
            );
        }
    };

    const handleAssignmentCreated = () => {
        if (selectedPeriodId) {
            fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
        }
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
                        <Button onClick={handleAddClick} disabled={!selectedPeriodId}>
                            {resources.addAssignmentButton}
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleEditClick}
                            disabled={!selectedAssignment}
                        >
                            {resources.editButton}
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleDeleteClick}
                            disabled={!selectedAssignment}
                        >
                            {resources.deleteButton}
                        </Button>
                    </Group>
                </div>

                {selectedPeriodId && (
                    <div className={styles.filtersRow}>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.userFilterLabel}
                                placeholder={resources.userFilterPlaceholder}
                                data={userOptions}
                                value={filterUserId}
                                onChange={setFilterUserId}
                                searchable
                                clearable
                            />
                        </div>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.activityFilterLabel}
                                placeholder={resources.activityFilterPlaceholder}
                                data={activityFilterOptions}
                                value={filterActivityId}
                                onChange={setFilterActivityId}
                                searchable
                                clearable
                            />
                        </div>
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

                <AddAssignmentModal
                    opened={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingAssignments(null);
                    }}
                    slots={slots}
                    activities={activities}
                    resourceList={resourceList}
                    weekNumOptions={weekNumFilterOptions}
                    onCreated={handleAssignmentCreated}
                    editingAssignments={editingAssignments}
                    isAllWeeksMode={isAllWeeksMode}
                    fromDate={currentPeriod?.fromDate}
                    toDate={currentPeriod?.toDate}
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

                {/* Edit Multi-Week Modal */}
                <Modal
                    opened={isEditMultiWeekModalOpen}
                    onClose={() => setIsEditMultiWeekModalOpen(false)}
                    title={resources.editMultiWeekTitle}
                    centered
                >
                    <Stack gap="md">
                        <Text size="sm">
                            {selectedGroup ? resources.editMultiWeekMessage
                                .replace("{weeks}", formatWeeksRange(selectedGroup.weeks, resources.weekNumFilterPlaceholder))
                                .replace("{day}", selectedGroup.day)
                                .replace("{time}", selectedGroup.time) : ""}
                        </Text>
                        <Radio.Group
                            value={multiWeekActionOption}
                            onChange={(val) => setMultiWeekActionOption(val as "all" | "single")}
                        >
                            <Stack gap="xs">
                                <Radio value="all" label={resources.editAllWeeksOption} />
                                <Radio value="single" label={resources.editSingleWeekOption} />
                            </Stack>
                        </Radio.Group>

                        {multiWeekActionOption === "single" && (
                            <Select
                                label={resources.selectDateToEdit || "Select date to edit"}
                                data={selectedGroup?.weeks.map((w) => {
                                    const dateStr = getAssignmentDateString(
                                        currentPeriod?.fromDate,
                                        w,
                                        selectedGroup.localWeekday
                                    );
                                    return {
                                        value: w === null ? "null" : String(w),
                                        label: w === null 
                                            ? (resources.weekNumFilterPlaceholder || "—") 
                                            : `${dateStr} (Week ${w})`
                                    };
                                }) || []}
                                value={selectedActionWeekNum}
                                onChange={setSelectedActionWeekNum}
                                required
                            />
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setIsEditMultiWeekModalOpen(false)}>
                                {resources.cancelButton}
                            </Button>
                            <Button onClick={handleConfirmEditMultiWeek}>
                                {resources.proceedButton}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Delete Multi-Week Modal */}
                <Modal
                    opened={isDeleteMultiWeekModalOpen}
                    onClose={() => setIsDeleteMultiWeekModalOpen(false)}
                    title={resources.deleteMultiWeekTitle}
                    centered
                >
                    <Stack gap="md">
                        <Text size="sm">
                            {selectedGroup ? resources.deleteMultiWeekMessage
                                .replace("{weeks}", formatWeeksRange(selectedGroup.weeks, resources.weekNumFilterPlaceholder))
                                .replace("{day}", selectedGroup.day)
                                .replace("{time}", selectedGroup.time) : ""}
                        </Text>
                        <Radio.Group
                            value={multiWeekActionOption}
                            onChange={(val) => setMultiWeekActionOption(val as "all" | "single")}
                        >
                            <Stack gap="xs">
                                <Radio value="all" label={resources.deleteAllWeeksOption} />
                                <Radio value="single" label={resources.deleteSingleWeekOption} />
                            </Stack>
                        </Radio.Group>

                        {multiWeekActionOption === "single" && (
                            <Select
                                label={resources.selectDateToDelete || "Select date to delete"}
                                data={selectedGroup?.weeks.map((w) => {
                                    const dateStr = getAssignmentDateString(
                                        currentPeriod?.fromDate,
                                        w,
                                        selectedGroup.localWeekday
                                    );
                                    return {
                                        value: w === null ? "null" : String(w),
                                        label: w === null 
                                            ? (resources.weekNumFilterPlaceholder || "—") 
                                            : `${dateStr} (Week ${w})`
                                    };
                                }) || []}
                                value={selectedActionWeekNum}
                                onChange={setSelectedActionWeekNum}
                                required
                            />
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setIsDeleteMultiWeekModalOpen(false)}>
                                {resources.cancelButton}
                            </Button>
                            <Button color="red" onClick={handleConfirmDeleteMultiWeek}>
                                {resources.deleteButton}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </div>
        </Container>
    );
}
