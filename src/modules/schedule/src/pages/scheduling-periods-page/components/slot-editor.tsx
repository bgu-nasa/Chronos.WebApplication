import { useEffect, useState } from "react";
import { Modal, Select, Button, Stack, Text, Group, Chip, Box, ActionIcon } from "@mantine/core";
import { useSlotEditorStore } from "@/modules/schedule/src/stores";
import { useCreateSlot, useUpdateSlot } from "@/modules/schedule/src/hooks";
import { Weekday, WeekdayOrder } from "@/modules/schedule/src/data";
import { convertSlotLocalToUtc, convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";

interface SlotEditorProps {
    schedulingPeriodId: string;
}

// Duration options in minutes
const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "150", label: "2.5 hours" },
    { value: "180", label: "3 hours" },
];

// TimeSpinner component with + above and - below, stepping by 30 minutes with wrap-around
interface TimeSpinnerProps {
    label: string;
    totalMinutes: number; // 0-1439 (24 hours * 60 minutes)
    onChange: (totalMinutes: number) => void;
    error?: string;
}

function TimeSpinner({ label, totalMinutes, onChange, error }: Readonly<TimeSpinnerProps>) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const displayTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const handleIncrement = () => {
        // Add 30 minutes with wrap-around (1440 = 24 hours in minutes)
        const newValue = (totalMinutes + 30) % 1440;
        onChange(newValue);
    };

    const handleDecrement = () => {
        // Subtract 30 minutes with wrap-around
        const newValue = (totalMinutes - 30 + 1440) % 1440;
        onChange(newValue);
    };

    return (
        <Box>
            <Text size="sm" fw={500} mb={4}>
                {label} <span style={{ color: "var(--mantine-color-error)" }}>*</span>
            </Text>
            <Stack gap={4} align="center" style={{ width: "fit-content" }}>
                <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={handleIncrement}
                    aria-label="Add 30 minutes"
                >
                    +
                </ActionIcon>
                <Box
                    style={{
                        padding: "8px 16px",
                        border: "1px solid var(--mantine-color-default-border)",
                        borderRadius: "var(--mantine-radius-sm)",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        minWidth: "80px",
                        textAlign: "center",
                        backgroundColor: "var(--mantine-color-default)",
                    }}
                >
                    {displayTime}
                </Box>
                <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={handleDecrement}
                    aria-label="Subtract 30 minutes"
                >
                    −
                </ActionIcon>
            </Stack>
            {error && <Text size="xs" c="var(--mantine-color-error)" mt={4}>{error}</Text>}
        </Box>
    );
}

// Day options for multi-select (Sunday first) - uses string values directly
const dayOptions = WeekdayOrder.map((day) => ({
    value: day,
    label: day,
}));

export function SlotEditor({ schedulingPeriodId }: Readonly<SlotEditorProps>) {
    const { isOpen, mode, slot, close } = useSlotEditorStore();
    const { createSlot, clearError: clearCreateError } = useCreateSlot();
    const { updateSlot, clearError: clearUpdateError } = useUpdateSlot();

    // Form state - Create mode (using total minutes)
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState(8 * 60); // 08:00 in minutes
    const [endTime, setEndTime] = useState(16 * 60); // 16:00 in minutes
    const [duration, setDuration] = useState<string | null>("60");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For edit mode - single day and times
    const [editWeekday, setEditWeekday] = useState<string | null>(null);
    const [editFromTime, setEditFromTime] = useState(8 * 60);
    const [editToTime, setEditToTime] = useState(9 * 60);

    // Clear related errors when values change
    const handleStartTimeChange = (value: number) => {
        setStartTime(value);
        setErrors((prev) => {
            const { startTime: _, endTime: __, duration: ___, ...rest } = prev;
            return rest;
        });
    };

    const handleEndTimeChange = (value: number) => {
        setEndTime(value);
        setErrors((prev) => {
            const { endTime: _, duration: __, ...rest } = prev;
            return rest;
        });
    };

    const handleDurationChange = (value: string | null) => {
        setDuration(value);
        setErrors((prev) => {
            const { duration: _, ...rest } = prev;
            return rest;
        });
    };

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            clearCreateError();
            clearUpdateError();
            setErrors({});

            if (mode === "edit" && slot) {
                // Edit mode: single slot
                const slotFromTime = slot.fromTime.split(':').slice(0, 2).join(':');
                const slotToTime = slot.toTime.split(':').slice(0, 2).join(':');
                const localSlots = convertSlotUtcToLocal(slot.weekday, slotFromTime, slotToTime);
                const localSlot = localSlots[0] ?? { weekday: slot.weekday, fromTime: slotFromTime, toTime: slotToTime };

                setEditWeekday(localSlot.weekday);
                // Parse local time to total minutes
                const fromParts = localSlot.fromTime.split(":");
                const toParts = localSlot.toTime.split(":");
                setEditFromTime(Number.parseInt(fromParts[0], 10) * 60 + Number.parseInt(fromParts[1], 10));
                setEditToTime(Number.parseInt(toParts[0], 10) * 60 + Number.parseInt(toParts[1], 10));
            } else {
                // Create mode: bulk creation
                setSelectedDays([]);
                setStartTime(8 * 60);
                setEndTime(16 * 60);
                setDuration("60");
            }
        }
    }, [isOpen, mode, slot]);

    const validateCreate = () => {
        const newErrors: Record<string, string> = {};
        if (selectedDays.length === 0) newErrors.days = "Please select at least one day";
        if (!duration) newErrors.duration = "Duration is required";
        if (startTime >= endTime) {
            newErrors.endTime = "End time must be after start time";
        }
        // Check if time range is divisible by duration
        if (duration && startTime < endTime) {
            const timeRange = endTime - startTime;
            const durationMinutes = Number.parseInt(duration, 10);
            if (timeRange < durationMinutes) {
                newErrors.duration = "Time range is too short for this duration";
            } else if (timeRange % durationMinutes !== 0) {
                newErrors.duration = "Time range must be evenly divisible by duration";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEdit = () => {
        const newErrors: Record<string, string> = {};
        if (!editWeekday) newErrors.weekday = "Day is required";
        if (editFromTime >= editToTime) {
            newErrors.toTime = "End time must be after start time";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Format total minutes to time string
    const formatTimeStr = (totalMinutes: number, withSeconds = false) => {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const h = hours.toString().padStart(2, "0");
        const m = mins.toString().padStart(2, "0");
        return withSeconds ? `${h}:${m}:00` : `${h}:${m}`;
    };

    const buildUtcSlotsForCreate = (durationMinutes: number) => {
        const slotsToCreate: { day: Weekday; fromTime: string; toTime: string }[] = [];

        let currentStart = startTime;
        while (currentStart + durationMinutes <= endTime) {
            const fromTimeStr = formatTimeStr(currentStart, true);
            const toTimeStr = formatTimeStr(currentStart + durationMinutes, true);

            selectedDays.forEach((dayStr) => {
                const utcSlots = convertSlotLocalToUtc(
                    dayStr,
                    fromTimeStr.split(":").slice(0, 2).join(":"),
                    toTimeStr.split(":").slice(0, 2).join(":")
                );

                utcSlots.forEach((utcSlot) => {
                    slotsToCreate.push({
                        day: utcSlot.weekday as Weekday,
                        fromTime: `${utcSlot.fromTime}:00`,
                        toTime: `${utcSlot.toTime}:00`,
                    });
                });
            });

            currentStart += durationMinutes;
        }

        return slotsToCreate;
    };

    const handleCreateSubmit = async () => {
        if (!validateCreate()) {
            return;
        }

        const durationMinutes = Number.parseInt(duration!, 10);
        const slotsToCreate = buildUtcSlotsForCreate(durationMinutes);

        let createdCount = 0;
        for (const slotData of slotsToCreate) {
            const result = await createSlot({
                schedulingPeriodId,
                weekday: slotData.day,
                fromTime: slotData.fromTime,
                toTime: slotData.toTime,
            });

            if (result !== null) {
                createdCount++;
            }
        }

        if (createdCount === slotsToCreate.length) {
            const pluralSuffix = createdCount === 1 ? "" : "s";
            $app.notifications.showSuccess("Success", `${createdCount} slot${pluralSuffix} created successfully`);
        } else {
            $app.notifications.showError("Error", `Only ${createdCount} of ${slotsToCreate.length} slots were created`);
        }

        close();
    };

    const handleEditSubmit = async () => {
        if (!slot || !validateEdit()) {
            return;
        }

        const localFromTime = formatTimeStr(editFromTime, false);
        const localToTime = formatTimeStr(editToTime, false);
        const utcSlots = convertSlotLocalToUtc(editWeekday as Weekday, localFromTime, localToTime);
        const utcSlot = utcSlots[0];

        const success = await updateSlot(slot.id, {
            weekday: utcSlot.weekday as Weekday,
            fromTime: `${utcSlot.fromTime}:00`,
            toTime: `${utcSlot.toTime}:00`,
        });

        if (success) {
            $app.notifications.showSuccess("Success", "Slot updated successfully");
            close();
            return;
        }

        $app.notifications.showError("Error", "Failed to update slot");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (mode === "create") {
                await handleCreateSubmit();
            } else if (mode === "edit") {
                await handleEditSubmit();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = mode === "create" ? resources.editorCreateTitle : resources.editorEditTitle;

    // Calculate slot count for preview
    const calculateSlotCount = () => {
        if (!duration || selectedDays.length === 0) return 0;
        if (startTime >= endTime) return 0;
        return Math.floor((endTime - startTime) / Number.parseInt(duration, 10)) * selectedDays.length;
    };

    return (
        <Modal opened={isOpen} onClose={close} title={title} size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {mode === "create" ? (
                        <>
                            <div>
                                <Text size="sm" fw={500} mb="xs">Days</Text>
                                <Chip.Group multiple value={selectedDays} onChange={setSelectedDays}>
                                    <Group gap="xs">
                                        {dayOptions.map((day) => (
                                            <Chip key={day.value} value={day.value} variant="filled">
                                                {day.label.substring(0, 3)}
                                            </Chip>
                                        ))}
                                    </Group>
                                </Chip.Group>
                                {errors.days && <Text size="xs" c="var(--mantine-color-error)" mt="xs">{errors.days}</Text>}
                            </div>

                            <Group grow align="flex-start">
                                <TimeSpinner
                                    label="Start Time"
                                    totalMinutes={startTime}
                                    onChange={handleStartTimeChange}
                                    error={errors.startTime}
                                />
                                <TimeSpinner
                                    label="End Time"
                                    totalMinutes={endTime}
                                    onChange={handleEndTimeChange}
                                    error={errors.endTime}
                                />
                            </Group>

                            <Select
                                label="Slot Duration"
                                placeholder="Select duration"
                                data={durationOptions}
                                value={duration}
                                onChange={handleDurationChange}
                                error={errors.duration}
                                required
                            />

                            {selectedDays.length > 0 && duration && calculateSlotCount() > 0 && (
                                <Text size="sm" c="dimmed">
                                    This will create{" "}
                                    <strong>{calculateSlotCount()}</strong>{" "}
                                    slots total
                                </Text>
                            )}
                        </>
                    ) : (
                        <>
                            <Select
                                label={resources.editorDayLabel}
                                placeholder={resources.editorDayPlaceholder}
                                data={dayOptions}
                                value={editWeekday}
                                onChange={setEditWeekday}
                                error={errors.weekday}
                                required
                            />

                            <Group grow align="flex-start">
                                <TimeSpinner
                                    label={resources.editorStartTimeLabel}
                                    totalMinutes={editFromTime}
                                    onChange={setEditFromTime}
                                    error={errors.fromTime}
                                />
                                <TimeSpinner
                                    label={resources.editorEndTimeLabel}
                                    totalMinutes={editToTime}
                                    onChange={setEditToTime}
                                    error={errors.toTime}
                                />
                            </Group>
                        </>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>
                            {resources.editorCancelButton}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {mode === "create" ? resources.editorCreateButton : resources.editorSaveButton}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
