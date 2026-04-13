import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import resources from "../appeals-page.resources.json";

interface AppealRow {
    id: string;
    title: string;
    description: string;
    assignmentId: string;
    raw: AppealResponse;
}

interface AppealsDataTableProps {
    appeals: AppealResponse[];
    selectedAppeal: AppealResponse | null;
    onSelectionChange: (appeal: AppealResponse | null) => void;
    isLoading?: boolean;
}

export function AppealsDataTable({
    appeals,
    selectedAppeal,
    onSelectionChange,
    isLoading = false,
}: AppealsDataTableProps) {
    const rows: AppealRow[] = useMemo(() => {
        return appeals.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            assignmentId: a.assignmentId,
            raw: a,
        }));
    }, [appeals]);

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
        </DataTable>
    );
}
