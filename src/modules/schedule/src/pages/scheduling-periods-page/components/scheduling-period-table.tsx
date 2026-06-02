import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Text, Stack } from "@mantine/core";
import type { SchedulingPeriodDataWithExpired } from "@/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page";
import resourcesJson from "@/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json",
    resourcesJson,
);
interface SchedulingPeriodTableProps {
    schedulingPeriods: SchedulingPeriodDataWithExpired[];
    selectedPeriod: SchedulingPeriodDataWithExpired | null;
    onSelectionChange: (period: SchedulingPeriodDataWithExpired | null) => void;
}

export function SchedulingPeriodTable({
    schedulingPeriods,
    selectedPeriod,
    onSelectionChange,
}: SchedulingPeriodTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<SchedulingPeriodDataWithExpired[]>
    ) => {
        onSelectionChange(e.value as SchedulingPeriodDataWithExpired | null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const fromDateTemplate = (rowData: SchedulingPeriodDataWithExpired) => {
        return formatDate(rowData.fromDate);
    };

    const toDateTemplate = (rowData: SchedulingPeriodDataWithExpired) => {
        return formatDate(rowData.toDate);
    };

    // Row class for expired periods
    const rowClassName = (data: SchedulingPeriodDataWithExpired) => {
        return data.isExpired ? "expired-row" : "";
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
        <>
            <style>
                {`
                    .expired-row {
                        opacity: 0.5;
                        background-color: var(--mantine-color-default-hover) !important;
                    }
                    .expired-row td {
                        color: var(--mantine-color-dimmed) !important;
                    }
                `}
            </style>
            <DataTable
                value={schedulingPeriods}
                selection={selectedPeriod}
                onSelectionChange={handleSelectionChange}
                selectionMode="single"
                dataKey="id"
                stripedRows
                paginator
                rows={10}
                emptyMessage={emptyMessage()}
                rowClassName={rowClassName}
                pt={{
                    root: { style: { backgroundColor: "transparent" } },
                    wrapper: { style: { backgroundColor: "transparent" } },
                    table: { style: { backgroundColor: "transparent" } },
                }}
            >
                <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
                <Column field="name" header={resources.nameColumn} sortable />
                <Column
                    field="fromDate"
                    header={resources.fromDateColumn}
                    body={fromDateTemplate}
                    sortable
                />
                <Column
                    field="toDate"
                    header={resources.toDateColumn}
                    body={toDateTemplate}
                    sortable
                />
            </DataTable>
        </>
    );
}
