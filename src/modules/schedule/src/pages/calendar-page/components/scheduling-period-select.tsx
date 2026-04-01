import { useEffect } from "react";
import { Select, Stack, Text } from "@mantine/core";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks/use-scheduling-periods";
import resources from "../calendar-page.resources.json";

interface SchedulingPeriodSelectProps {
    readonly value: string | null;
    readonly onChange: (value: string | null) => void;
}

export function SchedulingPeriodSelect({ value, onChange }: SchedulingPeriodSelectProps) {
    const { schedulingPeriods, isLoading, fetchSchedulingPeriods } = useSchedulingPeriods();

    useEffect(() => {
        void fetchSchedulingPeriods();
    }, [fetchSchedulingPeriods]);

    const data = schedulingPeriods.map((period) => ({
        value: period.id,
        label: period.name,
    }));

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>
                {resources.schedulingPeriodSelect.label}
            </Text>
            <Select
                placeholder={resources.schedulingPeriodSelect.placeholder}
                data={data}
                value={value}
                onChange={onChange}
                disabled={isLoading}
                nothingFoundMessage={resources.schedulingPeriodSelect.nothingFoundMessage}
                searchable
                clearable
            />
        </Stack>
    );
}
