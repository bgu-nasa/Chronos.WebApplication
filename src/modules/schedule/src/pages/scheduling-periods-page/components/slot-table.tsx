import { useMemo } from "react";
import { Paper, Text, Group, Stack, Badge } from "@mantine/core";
import { WeekdayOrder } from "@/modules/schedule/src/data";
import type { SlotResponse } from "@/modules/schedule/src/data";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";

interface SlotTableProps {
    slots: SlotResponse[];
    selectedSlot: SlotResponse | null;
    onSelectionChange: (slot: SlotResponse | null) => void;
}

export function SlotTable({
    slots,
    selectedSlot,
    onSelectionChange,
}: Readonly<SlotTableProps>) {
    const localSlotEntries = useMemo(() => {
        return slots.flatMap((slot) => {
            const fromTime = slot.fromTime.split(":").slice(0, 2).join(":");
            const toTime = slot.toTime.split(":").slice(0, 2).join(":");
            const converted = convertSlotUtcToLocal(slot.weekday, fromTime, toTime);

            return converted.map((entry) => ({
                slot,
                weekday: entry.weekday,
                fromTime: entry.fromTime,
                toTime: entry.toTime,
            }));
        });
    }, [slots]);

    // Group slots by day and sort by time within each day
    const groupedSlots = useMemo(() => {
        const groups: Record<string, Array<{ slot: SlotResponse; weekday: string; fromTime: string; toTime: string }>> = {};

        // Initialize groups for all days
        WeekdayOrder.forEach((day) => {
            groups[day] = [];
        });

        // Group slots by weekday
        localSlotEntries.forEach((slotEntry) => {
            const weekday = slotEntry.weekday;
            if (!groups[weekday]) {
                groups[weekday] = [];
            }
            groups[weekday].push(slotEntry);
        });

        // Sort slots within each day by fromTime
        Object.keys(groups).forEach((day) => {
            groups[day].sort((a, b) => a.fromTime.localeCompare(b.fromTime));
        });

        return groups;
    }, [localSlotEntries]);

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
                            {day}
                        </Text>
                        <Group gap="xs" wrap="wrap">
                            {daySlots.map((slotEntry) => (
                                <Badge
                                    key={`${slotEntry.slot.id}-${slotEntry.weekday}-${slotEntry.fromTime}-${slotEntry.toTime}`}
                                    size="lg"
                                    radius="sm"
                                    variant={selectedSlot?.id === slotEntry.slot.id ? "filled" : "light"}
                                    onClick={() => onSelectionChange(
                                        selectedSlot?.id === slotEntry.slot.id ? null : slotEntry.slot
                                    )}
                                    style={{ cursor: "pointer" }}
                                >
                                    {formatTime(slotEntry.fromTime)} - {formatTime(slotEntry.toTime)}
                                </Badge>
                            ))}
                        </Group>
                    </Paper>
                );
            })}
        </Stack>
    );
}
