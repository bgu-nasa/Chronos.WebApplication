import { useMemo } from "react";
import { Paper, Text, Group, Stack, Badge } from "@mantine/core";
import { WeekdayOrder } from "@/modules/schedule/src/data";
import type { SlotResponse } from "@/modules/schedule/src/data";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";
import { useLocalization } from "@/infra/service/localization";

interface SlotTableProps {
    slots: SlotResponse[];
    selectedSlot: SlotResponse | null;
    onSelectionChange: (slot: SlotResponse | null) => void;
}

export function SlotTable({
    slots,
    selectedSlot,
    onSelectionChange,
}: SlotTableProps) {
    const { t } = useLocalization();

    const getWeekdayLabel = (day: string) =>
        t(`weekday.${day.toLowerCase()}`, undefined, day);

    // Group slots by day and sort by time within each day
    const groupedSlots = useMemo(() => {
        const groups: Record<string, SlotResponse[]> = {};

        // Initialize groups for all days
        WeekdayOrder.forEach((day) => {
            groups[day] = [];
        });

        // Group slots by weekday
        slots.forEach((slot) => {
            const weekday = slot.weekday;
            if (!groups[weekday]) {
                groups[weekday] = [];
            }
            groups[weekday].push(slot);
        });

        // Sort slots within each day by fromTime
        Object.keys(groups).forEach((day) => {
            groups[day].sort((a, b) => a.fromTime.localeCompare(b.fromTime));
        });

        return groups;
    }, [slots]);

    // Format time for display (remove seconds if present)
    const formatTime = (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    };

    if (slots.length === 0) {
        return (
            <Paper p="xl" withBorder>
                <Text c="dimmed" ta="center">{resources.tableEmptyState}</Text>
            </Paper>
        );
    }

    return (
        <Stack gap="md">
            {WeekdayOrder.map((day) => {
                const daySlots = groupedSlots[day];
                if (!daySlots || daySlots.length === 0) return null;

                return (
                    <Paper key={day} p="sm" withBorder>
                        <Text fw={600} size="sm" mb="xs">
                            {getWeekdayLabel(day)}
                        </Text>
                        <Group gap="xs" wrap="wrap">
                            {daySlots.map((slot) => (
                                <Badge
                                    key={slot.id}
                                    size="lg"
                                    radius="sm"
                                    variant={selectedSlot?.id === slot.id ? "filled" : "light"}
                                    onClick={() => onSelectionChange(
                                        selectedSlot?.id === slot.id ? null : slot
                                    )}
                                    style={{ cursor: "pointer" }}
                                >
                                    {formatTime(slot.fromTime)} - {formatTime(slot.toTime)}
                                </Badge>
                            ))}
                        </Group>
                    </Paper>
                );
            })}
        </Stack>
    );
}
