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
import resources from "../appeals-page.resources.json";

interface AppealRow {
    id: string;
    title: string;
    description: string;
    day: string;
    time: string;
    activityDisplay: string;
    resourceDisplay: string;
    raw: AppealResponse;
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

const formatTime = (time: string) => {
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
};

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
        return appeals.map((appeal) => {
            const assignment = assignmentMap.get(appeal.assignmentId);
            const slot = assignment ? slotMap.get(assignment.slotId) : undefined;
            const activity = assignment ? activityMap.get(assignment.activityId) : undefined;

            return {
                id: appeal.id,
                title: appeal.title,
                description: appeal.description,
                day: slot?.weekday || "—",
                time: slot ? `${formatTime(slot.fromTime)} - ${formatTime(slot.toTime)}` : "—",
                activityDisplay: activity?.displayLabel || "—",
                resourceDisplay: assignment ? (resourceMap.get(assignment.resourceId) || "—") : "—",
                raw: appeal,
            };
        });
    }, [appeals, assignmentMap, slotMap, activityMap, resourceMap]);

    const selectedRow = useMemo(() => {
        if (!selectedAppeal) return null;
        return rows.find((r) => r.id === selectedAppeal.id) || null;
    }, [selectedAppeal, rows]);

    const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<AppealRow[]>) => {
        const row = e.value as AppealRow | null;
        onSelectionChange(row ? row.raw : null);
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
            <Column field="day" header={resources.dayColumn} sortable />
            <Column field="time" header={resources.timeColumn} sortable />
            <Column field="activityDisplay" header={resources.activityColumn} sortable />
            <Column field="resourceDisplay" header={resources.resourceColumn} sortable />
        </DataTable>
    );
}
