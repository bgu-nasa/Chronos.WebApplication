import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { SubjectData } from "./types";
import resourcesJson from "../../subjects-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/subjects-page/subjects-page.resources.json",
    resourcesJson,
);
interface SubjectTableProps {
    subjects: SubjectData[];
    selectedSubject: SubjectData | null;
    onSelectionChange: (subject: SubjectData | null) => void;
}

export function SubjectTable({
    subjects,
    selectedSubject,
    onSelectionChange,
}: SubjectTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<SubjectData[]>
    ) => {
        onSelectionChange(e.value as SubjectData | null);
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
            value={subjects}
            selection={selectedSubject}
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
            <Column field="departmentName" header={resources.departmentColumn} sortable />
            <Column field="schedulingPeriodName" header={resources.schedulingPeriodColumn} sortable />
            <Column field="code" header={resources.codeColumn} sortable />
            <Column field="name" header={resources.nameColumn} sortable />
        </DataTable>
    );
}
