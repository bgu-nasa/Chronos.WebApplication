import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Group, Pill, Stack, Text } from "@mantine/core";
import { $app } from "@/infra/service";
import type { RoleTableRow } from "@/modules/management/src/pages/roles-page/components/role-table/types";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/roles-page/roles-page.resources.json",
    resourcesJson,
);
interface RoleTableProps {
    rows: RoleTableRow[];
    selectedRow: RoleTableRow | null;
    onSelectionChange: (row: RoleTableRow | null) => void;
}

export function RoleTable({
    rows,
    selectedRow,
    onSelectionChange,
}: RoleTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<RoleTableRow[]>
    ) => {
        onSelectionChange(e.value as RoleTableRow | null);
    };

    const scopeTemplate = (rowData: RoleTableRow) => {
        if (rowData.scope === "Department" && rowData.scopeId) {
            // Get department name from $app
            const departments =
                $app.organization.getOrganization()?.departments || [];
            const department = departments.find(
                (d) => d.id === rowData.scopeId
            );
            const departmentName = department?.name || rowData.scopeId;
            return (
                <Text size="sm">
                    {resources.scopeDeptLabel.replace(
                        "{departmentName}",
                        departmentName,
                    )}
                </Text>
            );
        }

        return <Text size="sm">{resources.scopeOrgLabel}</Text>;
    };

    const rolesTemplate = (rowData: RoleTableRow) => {
        return (
            <Group gap="xs">
                {rowData.roles.map((role, index) => (
                    <Pill key={`${rowData.id}-${role}-${index}`} size="sm">
                        {role}
                    </Pill>
                ))}
            </Group>
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
            value={rows}
            selection={selectedRow}
            onSelectionChange={handleSelectionChange}
            selectionMode="single"
            dataKey="id"
            stripedRows
            paginator
            rows={10}
            emptyMessage={emptyMessage()}
        >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column
                field="userEmail"
                header={resources.userEmailColumn}
                sortable
            />
            <Column
                field="scope"
                header={resources.scopeColumn}
                body={scopeTemplate}
                sortable
            />
            <Column
                field="roles"
                header={resources.rolesColumn}
                body={rolesTemplate}
            />
        </DataTable>
    );
}
