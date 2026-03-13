import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { ResourceAttributeData } from "./types";
import resources from "../../resource-attributes-page.resources.json";

interface ResourceAttributeTableProps {
    resourceAttributes: ResourceAttributeData[];
    selectedResourceAttribute: ResourceAttributeData | null;
    onSelectionChange: (resourceAttribute: ResourceAttributeData | null) => void;
}

export function ResourceAttributeTable({
    resourceAttributes,
    selectedResourceAttribute,
    onSelectionChange,
}: ResourceAttributeTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<ResourceAttributeData[]>
    ) => {
        onSelectionChange(e.value as ResourceAttributeData | null);
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
            value={resourceAttributes}
            selection={selectedResourceAttribute}
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
            <Column field="title" header={resources.titleColumn} sortable />
            <Column field="description" header={resources.descriptionColumn} sortable />
        </DataTable>
    );
}
