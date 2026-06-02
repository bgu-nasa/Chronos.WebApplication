import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Button, Stack, Text, Group, Chip } from "@mantine/core";
import { useSlotEditorStore } from "@/modules/schedule/src/stores";
import { useCreateSlot, useUpdateSlot } from "@/modules/schedule/src/hooks";
import { getWeekdayShortLabel, getWeekdaySelectOptions, Weekday } from "@/common/weekdays";
import { convertSlotLocalToUtc, convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import { TimeSpinner } from "@/common/components/time-spinner";
import resourcesJson from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json",
    resourcesJson,
);
interface SlotEditorProps {
    schedulingPeriodId: string;
}

const durationMinutes = ["30", "60", "90", "120", "150", "180"] as const;

export function SlotEditor({ schedulingPeriodId }: Readonly<SlotEditorProps>) {
    const language = useLocaleStore((state) => state.language);

    const durationLabels = resources.durationLabels as Record<string, string>;

    const durationOptions = useMemo(
        () =>
            durationMinutes.map((minutes) => ({
                value: minutes,
                label: durationLabels[minutes] ?? minutes,
            })),
        [durationLabels],
    );

    const dayOptions = useMemo(() => getWeekdaySelectOptions(), [language]);
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
        if (selectedDays.length === 0) {
            newErrors.days = resources.validation.daysRequired;
        }
        if (!duration) {
            newErrors.duration = resources.validation.durationRequired;
        }
        if (startTime >= endTime) {
            newErrors.endTime = resources.validation.endTimeAfterStart;
        }
        // Check if time range is divisible by duration
        if (duration && startTime < endTime) {
            const timeRange = endTime - startTime;
            const durationMins = Number.parseInt(duration, 10);
            if (timeRange < durationMins) {
                newErrors.duration = resources.validation.durationTooShort;
            } else if (timeRange % durationMins !== 0) {
                newErrors.duration = resources.validation.durationNotDivisible;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEdit = () => {
        const newErrors: Record<string, string> = {};
        if (!editWeekday) {
            newErrors.weekday = resources.validation.weekdayRequired;
        }
        if (editFromTime >= editToTime) {
            newErrors.toTime = resources.validation.endTimeAfterStart;
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
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.slotsCreatedSuccess.replace("{count}", String(createdCount)),
            );
        } else {
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.slotsCreatedPartial
                    .replace("{created}", String(createdCount))
                    .replace("{total}", String(slotsToCreate.length)),
            );
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
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.slotUpdateSuccess,
            );
            close();
            return;
        }

        $app.notifications.showError(
            notificationResources.errorTitle,
            resources.notifications.slotUpdateError,
        );
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
                                <Text size="sm" fw={500} mb="xs">{resources.editorDaysLabel}</Text>
                                <Chip.Group multiple value={selectedDays} onChange={setSelectedDays}>
                                    <Group gap="xs">
                                        {dayOptions.map((day) => (
                                            <Chip key={day.value} value={day.value} variant="filled">
                                                {getWeekdayShortLabel(day.value)}
                                            </Chip>
                                        ))}
                                    </Group>
                                </Chip.Group>
                                {errors.days && <Text size="xs" c="var(--mantine-color-error)" mt="xs">{errors.days}</Text>}
                            </div>

                            <Group grow align="flex-start">
                                <TimeSpinner
                                    label={resources.editorStartTimeLabel}
                                    totalMinutes={startTime}
                                    onChange={handleStartTimeChange}
                                    error={errors.startTime}
                                />
                                <TimeSpinner
                                    label={resources.editorEndTimeLabel}
                                    totalMinutes={endTime}
                                    onChange={handleEndTimeChange}
                                    error={errors.endTime}
                                />
                            </Group>

                            <Select
                                label={resources.editorSlotDurationLabel}
                                placeholder={resources.editorDurationPlaceholder}
                                data={durationOptions}
                                value={duration}
                                onChange={handleDurationChange}
                                error={errors.duration}
                                required
                            />

                            {selectedDays.length > 0 && duration && calculateSlotCount() > 0 && (
                                <Text size="sm" c="dimmed">
                                    {resources.editorSlotCountPreview.replace(
                                        "{count}",
                                        String(calculateSlotCount()),
                                    )}
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
