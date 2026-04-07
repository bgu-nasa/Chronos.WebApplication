import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { ActivityData } from "./types";
import resources from "../../activities-page.resources.json";

interface ActivityTableProps {
    activities: ActivityData[];
    selectedActivity: ActivityData | null;
    onSelectionChange: (activity: ActivityData | null) => void;
    loading?: boolean;
}

export function ActivityTable({
    activities,
    selectedActivity,
    onSelectionChange,
    loading: externalLoading,
}: ActivityTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<ActivityData[]>
    ) => {
        onSelectionChange(e.value as ActivityData | null);
    };

    const emptyMessage = () => {
        return (
            <Stack align="center" justify="center" style={{ padding: "3rem" }}>
                <Text size="lg" c="dimmed" ta="center">
                    {resources.emptyStateMessage}
                </Text>
            </Stack>
        );
    };

    return (
        <DataTable
            value={activities}
            selection={selectedActivity}
            onSelectionChange={handleSelectionChange}
            selectionMode="single"
            dataKey="id"
            stripedRows
            paginator
            rows={10}
            emptyMessage={emptyMessage()}
            loading={externalLoading}
            pt={{
                root: { style: { backgroundColor: "transparent" } },
                wrapper: { style: { backgroundColor: "transparent" } },
                table: { style: { backgroundColor: "transparent" } },
            }}
        >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column field="activityType" header={resources.activityTypeColumn} sortable />
            <Column 
                field="assignedUserName" 
                header={resources.assignedUserColumn} 
                sortable 
            />
            <Column 
                field="expectedStudents" 
                header={resources.expectedStudentsColumn} 
                sortable 
                body={(rowData: ActivityData) => rowData.expectedStudents ?? "N/A"}
            />
            <Column 
                field="duration" 
                header={resources.durationColumn} 
                sortable 
            />
        </DataTable>
    );
}
