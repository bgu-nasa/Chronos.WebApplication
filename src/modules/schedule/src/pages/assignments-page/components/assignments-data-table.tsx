import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import resources from "../assignments-page.resources.json";

interface AssignmentRow {
    id: string;
    resourceDisplay: string;
    activityDisplay: string;
    userDisplay: string;
    day: string;
    time: string;
    raw: AssignmentResponse;
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
    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
    const activityMap = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
    const resourceMap = useMemo(
        () => new Map(resourceList.map((r) => [r.id, `${r.location} / ${r.identifier}`])),
        [resourceList]
    );

    const formatTime = (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    };

    const rows: AssignmentRow[] = useMemo(() => {
        return assignments.map((a) => {
            const slot = slotMap.get(a.slotId);
            const activity = activityMap.get(a.activityId);
            const resourceDisplay = resourceMap.get(a.resourceId) || a.resourceId;
            const activityDisplay = activity?.displayLabel || a.activityId;
            const day = slot?.weekday || "—";
            const time = slot ? `${formatTime(slot.fromTime)} - ${formatTime(slot.toTime)}` : "—";

            return {
                id: a.id,
                resourceDisplay,
                activityDisplay,
                userDisplay: activity?.userFullName || "—",
                day,
                time,
                raw: a,
            };
        });
    }, [assignments, slotMap, activityMap, resourceMap]);

    const selectedRow = useMemo(() => {
        if (!selectedAssignment) return null;
        return rows.find((r) => r.id === selectedAssignment.id) || null;
    }, [selectedAssignment, rows]);

    const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<AssignmentRow[]>) => {
        const row = e.value as AssignmentRow | null;
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
            <Column field="day" header={resources.dayColumn} sortable />
            <Column field="time" header={resources.timeColumn} sortable />
            <Column field="activityDisplay" header={resources.activityColumn} sortable />
            <Column field="userDisplay" header={resources.userColumn} sortable />
            <Column field="resourceDisplay" header={resources.resourceColumn} sortable />
        </DataTable>
    );
}
