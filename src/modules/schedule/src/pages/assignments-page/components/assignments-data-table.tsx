import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import { getWeekdayLabel } from "@/common/weekdays";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import { useLocaleStore } from "@/infra/theme/state";
import resourcesJson from "../assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/schedule/src/pages/assignments-page/assignments-page.resources.json",
    resourcesJson,
);
export interface GroupedAssignmentRow {
    id: string;
    resourceDisplay: string;
    activityDisplay: string;
    userDisplay: string;
    day: string;
    time: string;
    weekNum: number | null;
    weekDisplay: string;
    assignments: AssignmentResponse[];
}

export function formatWeeksRange(weeks: (number | null)[], placeholder: string = "—"): string {
    const numericWeeks = weeks.filter((w): w is number => w !== null);
    if (numericWeeks.length === 0) {
        return placeholder;
    }

    numericWeeks.sort((a, b) => a - b);

    const ranges: string[] = [];
    let start = numericWeeks[0];
    let prev = numericWeeks[0];

    for (let i = 1; i < numericWeeks.length; i++) {
        const curr = numericWeeks[i];
        if (curr === prev + 1) {
            prev = curr;
        } else {
            if (start === prev) {
                ranges.push(String(start));
            } else {
                ranges.push(`${start}-${prev}`);
            }
            start = curr;
            prev = curr;
        }
    }

    if (start === prev) {
        ranges.push(String(start));
    } else {
        ranges.push(`${start}-${prev}`);
    }

    return ranges.join(", ");
}

interface AssignmentsDataTableProps {
    assignments: AssignmentResponse[];
    slots: SlotResponse[];
    activities: EnrichedActivity[];
    resourceList: ResourceResponse[];
    selectedAssignment: AssignmentResponse | null;
    onSelectionChange: (assignment: AssignmentResponse | null) => void;
    isLoading?: boolean;
}

export function AssignmentsDataTable({
    assignments,
    slots,
    activities,
    resourceList,
    selectedAssignment,
    onSelectionChange,
    isLoading = false,
}: AssignmentsDataTableProps) {
    const language = useLocaleStore((state) => state.language);
    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
    const activityMap = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
    const resourceMap = useMemo(
        () => new Map(resourceList.map((r) => [r.id, `${r.location} / ${r.identifier}`])),
        [resourceList]
    );

    const rows: GroupedAssignmentRow[] = useMemo(() => {
        // 1. Enrich assignments with local time & weekday details
        const enriched = assignments.map((a) => {
            const slot = slotMap.get(a.slotId);
            const activity = activityMap.get(a.activityId);
            const resourceDisplay = resourceMap.get(a.resourceId) || a.resourceId;
            const activityDisplay = activity?.displayLabel || a.activityId;
            const userDisplay = activity?.userFullName || "—";

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
                userDisplay,
                resourceDisplay,
            };
        });

        // 2. Group within each week first (to find consecutive blocks of slots)
        const byWeek: Record<string, typeof enriched> = {};
        for (const item of enriched) {
            const wKey = item.raw.weekNum === null ? "null" : String(item.raw.weekNum);
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
            assignments: AssignmentResponse[];
            activityDisplay: string;
            userDisplay: string;
            resourceDisplay: string;
        }

        const weeklyGroups: WeeklyGroupedBlock[] = [];

        const createBlock = (items: typeof enriched): WeeklyGroupedBlock => {
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
                activityDisplay: first.activityDisplay,
                userDisplay: first.userDisplay,
                resourceDisplay: first.resourceDisplay,
            };
        };

        for (const wKey in byWeek) {
            const weekItems = byWeek[wKey];

            // Group by activityId + resourceId + localWeekday
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

        // 3. Group weekly blocks across different weeks
        const multiWeekGroups: Record<string, WeeklyGroupedBlock[]> = {};
        for (const block of weeklyGroups) {
            const key = `${block.activityId}_${block.resourceId}_${block.localWeekday}_${block.localFromTime}_${block.localToTime}`;
            if (!multiWeekGroups[key]) multiWeekGroups[key] = [];
            multiWeekGroups[key].push(block);
        }

        const finalRows: GroupedAssignmentRow[] = [];
        for (const key in multiWeekGroups) {
            const blocks = multiWeekGroups[key];
            blocks.sort((a, b) => {
                if (a.weekNum === null) return -1;
                if (b.weekNum === null) return 1;
                return a.weekNum - b.weekNum;
            });

            const firstBlock = blocks[0];
            const weeksList = blocks.map((b) => b.weekNum);

            let weekDisplay = "";
            if (weeksList.includes(null)) {
                weekDisplay = resources.weekNumFilterPlaceholder || "—";
            } else {
                weekDisplay = formatWeeksRange(weeksList, resources.weekNumFilterPlaceholder);
            }

            const allAssignments = blocks.flatMap((b) => b.assignments);
            const dayDisplay = firstBlock.localWeekday === "—" ? "—" : getWeekdayLabel(firstBlock.localWeekday);
            const timeDisplay =
                firstBlock.localFromTime === "—" || firstBlock.localToTime === "—"
                    ? "—"
                    : `${firstBlock.localFromTime} - ${firstBlock.localToTime}`;

            const rowId = allAssignments
                .map((a) => a.id)
                .sort((a, b) => a.localeCompare(b))
                .join("_");

            finalRows.push({
                id: rowId,
                resourceDisplay: firstBlock.resourceDisplay,
                activityDisplay: firstBlock.activityDisplay,
                userDisplay: firstBlock.userDisplay,
                day: dayDisplay,
                time: timeDisplay,
                weekNum: firstBlock.weekNum,
                weekDisplay,
                assignments: allAssignments,
            });
        }

        return finalRows;
    }, [assignments, slotMap, activityMap, resourceMap, language]);

    const selectedRow = useMemo(() => {
        if (!selectedAssignment) return null;
        return rows.find((r) => r.assignments.some((a) => a.id === selectedAssignment.id)) || null;
    }, [selectedAssignment, rows]);

    const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<GroupedAssignmentRow[]>) => {
        const row = e.value as GroupedAssignmentRow | null;
        onSelectionChange(row && row.assignments.length > 0 ? row.assignments[0] : null);
    };

    const emptyMessage = () => (
        <Stack align="center" justify="center" style={{ padding: "3rem" }}>
            <Text size="lg" c="dimmed" ta="center">
                {resources.emptyStateMessage}
            </Text>
        </Stack>
    );

    return (
        <DataTable
            value={rows}
            selection={selectedRow}
            onSelectionChange={handleSelectionChange}
            selectionMode="single"
            dataKey="id"
            stripedRows
            paginator
            rows={10}
            loading={isLoading}
            emptyMessage={emptyMessage()}
            pt={{
                root: { style: { backgroundColor: "transparent" } },
                wrapper: { style: { backgroundColor: "transparent" } },
                table: { style: { backgroundColor: "transparent" } },
            }}
        >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column
                field="weekNum"
                header={resources.weekNumColumn}
                sortable
                body={(row: GroupedAssignmentRow) => row.weekDisplay}
            />
            <Column field="day" header={resources.dayColumn} sortable />
            <Column field="time" header={resources.timeColumn} sortable />
            <Column field="activityDisplay" header={resources.activityColumn} sortable />
            <Column field="userDisplay" header={resources.userColumn} sortable />
            <Column field="resourceDisplay" header={resources.resourceColumn} sortable />
        </DataTable>
    );
}
