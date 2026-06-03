import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { ResourceData } from "./types";
import resourcesJson from "../../resources-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resources-page/resources-page.resources.json",
    resourcesJson,
);
interface ResourceTableProps {
    resources: ResourceData[];
    selectedResource: ResourceData | null;
    onSelectionChange: (resource: ResourceData | null) => void;
}

export function ResourceTable({
    resources: resourcesData,
    selectedResource,
    onSelectionChange,
}: ResourceTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<ResourceData[]>
    ) => {
        onSelectionChange(e.value as ResourceData | null);
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
            value={resourcesData}
            selection={selectedResource}
            onSelectionChange={handleSelectionChange}
            selectionMode="single"
            dataKey="id"
            stripedRows
            paginator
            rows={10}
            emptyMessage={emptyMessage()}
            pt={{
                root: { style: { backgroundColor: "transparent" } },
                wrapper: { style: { backgroundColor: "transparent" } },
                table: { style: { backgroundColor: "transparent" } },
            }}
        >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column field="identifier" header={resources.identifierColumn} sortable />
            <Column field="resourceTypeName" header={resources.resourceTypeColumn} sortable />
            <Column field="location" header={resources.locationColumn} sortable />
            <Column
                field="capacity"
                header={resources.capacityColumn}
                sortable
                body={(rowData: ResourceData) => rowData.capacity ?? "N/A"}
            />
        </DataTable>
    );
}
