import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { ResourceTypeData } from "./types";
import resourcesJson from "../../resource-types-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resource-types-page/resource-types-page.resources.json",
    resourcesJson,
);
interface ResourceTypeTableProps {
    resourceTypes: ResourceTypeData[];
    selectedResourceType: ResourceTypeData | null;
    onSelectionChange: (resourceType: ResourceTypeData | null) => void;
}

export function ResourceTypeTable({
    resourceTypes,
    selectedResourceType,
    onSelectionChange,
}: ResourceTypeTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<ResourceTypeData[]>
    ) => {
        onSelectionChange(e.value as ResourceTypeData | null);
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
            value={resourceTypes}
            selection={selectedResourceType}
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
            <Column field="type" header={resources.typeColumn} sortable />
        </DataTable>
    );
}
