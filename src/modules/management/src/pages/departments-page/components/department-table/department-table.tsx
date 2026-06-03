import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge, Text, Stack, useMantineTheme } from "@mantine/core";
import type { DepartmentData } from "@/modules/management/src/pages/departments-page/components/department-table/types";
import resourcesJson from "@/modules/management/src/pages/departments-page/departments-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/departments-page/departments-page.resources.json",
    resourcesJson,
);
interface DepartmentTableProps {
    departments: DepartmentData[];
    selectedDepartment: DepartmentData | null;
    onSelectionChange: (department: DepartmentData | null) => void;
}

export function DepartmentTable({
    departments,
    selectedDepartment,
    onSelectionChange,
}: DepartmentTableProps) {
    const theme = useMantineTheme();

    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<DepartmentData[]>
    ) => {
        onSelectionChange(e.value as DepartmentData | null);
    };

    const statusTemplate = (rowData: DepartmentData) => {
        return (
            <Badge
                color={rowData.deleted ? "gray" : theme.primaryColor}
                variant="light"
            >
                {rowData.deleted ? resources.deleted : resources.active}
            </Badge>
        );
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
            value={departments}
            selection={selectedDepartment}
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
            <Column field="name" header={resources.nameColumn} sortable />
            <Column
                field="deleted"
                header={resources.statusColumn}
                body={statusTemplate}
                sortable
            />
        </DataTable>
    );
}
