import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import { getWeekdayLabel } from "@/common/weekdays";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import { useLocaleStore } from "@/infra/theme/state";
import { formatWeeksRange } from "@/modules/schedule/src/pages/assignments-page/components/assignments-data-table";
import resourcesJson from "../appeals-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/schedule/src/pages/appeals-page/appeals-page.resources.json",
    resourcesJson,
);

interface AppealRow {
    id: string;
    title: string;
    description: string;
    day: string;
    time: string;
    weekDisplay: string;
    activityDisplay: string;
    resourceDisplay: string;
    appeals: AppealResponse[];
}

interface AppealsDataTableProps {
    appeals: AppealResponse[];
    assignments: AssignmentResponse[];
    slots: SlotResponse[];
    activities: EnrichedActivity[];
    resourceList: ResourceResponse[];
    selectedAppeal: AppealResponse | null;
    onSelectionChange: (appeal: AppealResponse | null) => void;
    isLoading?: boolean;
}

export function AppealsDataTable({
    appeals,
    assignments,
    slots,
    activities,
    resourceList,
    selectedAppeal,
    onSelectionChange,
    isLoading = false,
}: AppealsDataTableProps) {
    const language = useLocaleStore((state) => state.language);
    const assignmentMap = useMemo(
        () => new Map(assignments.map((a) => [a.id, a])),
        [assignments]
    );
    const slotMap = useMemo(
        () => new Map(slots.map((s) => [s.id, s])),
        [slots]
    );
    const activityMap = useMemo(
        () => new Map(activities.map((a) => [a.id, a])),
        [activities]
    );
    const resourceMap = useMemo(
        () => new Map(resourceList.map((r) => [r.id, `${r.location} / ${r.identifier}`])),
        [resourceList]
    );

    const rows: AppealRow[] = useMemo(() => {
        const enriched = appeals.map((appeal) => {
            const assignment = assignmentMap.get(appeal.assignmentId);
            const slot = assignment ? slotMap.get(assignment.slotId) : undefined;
            const activity = assignment ? activityMap.get(assignment.activityId) : undefined;
            const resourceDisplay = assignment ? (resourceMap.get(assignment.resourceId) || assignment.resourceId) : "—";
            const activityDisplay = activity?.displayLabel || (assignment?.activityId) || "—";

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
                activityDisplay,
                resourceDisplay,
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
            activityDisplay: string;
            resourceDisplay: string;
        }

        const weeklyGroups: WeeklyGroupedBlock[] = [];

        const createBlock = (items: typeof enriched): WeeklyGroupedBlock => {
            const first = items[0];
            const last = items.at(-1);
            return {
                activityId: first.assignment?.activityId || "",
                resourceId: first.assignment?.resourceId || "",
                localWeekday: first.localWeekday,
                localFromTime: first.localFromTime,
                localToTime: last?.localToTime || "",
                weekNum: first.assignment?.weekNum ?? null,
                appeals: items.map((i) => i.raw),
                activityDisplay: first.activityDisplay,
                resourceDisplay: first.resourceDisplay,
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

        const finalRows: AppealRow[] = [];
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
                weekDisplay = "—";
            } else {
                weekDisplay = formatWeeksRange(weeksList, "—");
            }

            const allAppeals = blocks.flatMap((b) => b.appeals);
            const dayDisplay = firstBlock.localWeekday === "—" ? "—" : getWeekdayLabel(firstBlock.localWeekday);
            const timeDisplay =
                firstBlock.localFromTime === "—" || firstBlock.localToTime === "—"
                    ? "—"
                    : `${firstBlock.localFromTime} - ${firstBlock.localToTime}`;

            const rowId = allAppeals
                .map((a) => a.id)
                .sort((a, b) => a.localeCompare(b))
                .join("_");

            finalRows.push({
                id: rowId,
                title: firstBlock.appeals[0]?.title || "—",
                description: firstBlock.appeals[0]?.description || "—",
                day: dayDisplay,
                time: timeDisplay,
                weekDisplay,
                activityDisplay: firstBlock.activityDisplay,
                resourceDisplay: firstBlock.resourceDisplay,
                appeals: allAppeals,
            });
        }

        return finalRows;
    }, [appeals, assignmentMap, slotMap, activityMap, resourceMap, language]);

    const selectedRow = useMemo(() => {
        if (!selectedAppeal) return null;
        return rows.find((r) => r.appeals.some((a) => a.id === selectedAppeal.id)) || null;
    }, [selectedAppeal, rows]);

    const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<AppealRow[]>) => {
        const row = e.value as AppealRow | null;
        onSelectionChange(row && row.appeals.length > 0 ? row.appeals[0] : null);
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
            <Column field="title" header={resources.titleColumn} sortable />
            <Column field="description" header={resources.descriptionColumn} sortable />
            <Column field="weekDisplay" header={resources.weekColumn} sortable />
            <Column field="day" header={resources.dayColumn} sortable />
            <Column field="time" header={resources.timeColumn} sortable />
            <Column field="activityDisplay" header={resources.activityColumn} sortable />
            <Column field="resourceDisplay" header={resources.resourceColumn} sortable />
        </DataTable>
    );
}
