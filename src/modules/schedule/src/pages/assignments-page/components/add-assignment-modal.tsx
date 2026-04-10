import { useEffect, useState, useMemo } from "react";
import { Modal, Select, Button, Group, Stack } from "@mantine/core";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import { WeekdayOrder } from "@/modules/schedule/src/data/slot.types";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import resources from "../assignments-page.resources.json";

interface AddAssignmentModalProps {
    opened: boolean;
    onClose: () => void;
    slots: SlotResponse[];
    activities: EnrichedActivity[];
    resourceList: ResourceResponse[];
    onCreated: () => void;
    editingAssignment?: AssignmentResponse | null;
}

export function AddAssignmentModal({
    opened,
    onClose,
    slots,
    activities,
    resourceList,
    onCreated,
    editingAssignment,
}: AddAssignmentModalProps) {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!editingAssignment;

    const availableDays = useMemo(() => {
        const daysWithSlots = new Set(slots.map((s) => s.weekday));
        return WeekdayOrder.filter((day) => daysWithSlots.has(day)).map((day) => ({
            value: day,
            label: day,
        }));
    }, [slots]);

    const formatTime = (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    };

    const filteredSlots = useMemo(() => {
        if (!selectedDay) return [];
        return slots
            .filter((s) => s.weekday === selectedDay)
            .sort((a, b) => a.fromTime.localeCompare(b.fromTime))
            .map((s) => ({
                value: s.id,
                label: `${formatTime(s.fromTime)} - ${formatTime(s.toTime)}`,
            }));
    }, [selectedDay, slots]);

    const activityOptions = useMemo(() => {
        return activities.map((a) => ({
            value: a.id,
            label: a.displayLabel,
        }));
    }, [activities]);

    const resourceOptions = useMemo(() => {
        return resourceList.map((r) => ({
            value: r.id,
            label: `${r.location} / ${r.identifier}`,
        }));
    }, [resourceList]);

    useEffect(() => {
        if (opened) {
            setErrors({});
            if (isEditMode && editingAssignment) {
                const slot = slots.find((s) => s.id === editingAssignment.slotId);
                setSelectedDay(slot?.weekday || null);
                setSelectedSlotId(editingAssignment.slotId);
                setSelectedActivityId(editingAssignment.activityId);
                setSelectedResourceId(editingAssignment.resourceId);
            } else {
                setSelectedDay(null);
                setSelectedSlotId(null);
                setSelectedActivityId(null);
                setSelectedResourceId(null);
            }
        }
    }, [opened, editingAssignment]);

    useEffect(() => {
        if (!isEditMode) {
            setSelectedSlotId(null);
        }
    }, [selectedDay]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedDay) newErrors.day = "Day is required";
        if (!selectedSlotId) newErrors.slot = "Slot is required";
        if (!selectedActivityId) newErrors.activity = "Activity is required";
        if (!selectedResourceId) newErrors.resource = "Resource is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            if (isEditMode && editingAssignment) {
                await assignmentDataRepository.updateAssignment(editingAssignment.id, {
                    slotId: selectedSlotId!,
                    resourceId: selectedResourceId!,
                    activityId: selectedActivityId!,
                });
                $app.notifications.showSuccess("Success", "Assignment updated successfully");
            } else {
                await assignmentDataRepository.createAssignment({
                    slotId: selectedSlotId!,
                    resourceId: selectedResourceId!,
                    activityId: selectedActivityId!,
                });
                $app.notifications.showSuccess("Success", "Assignment created successfully");
            }
            onCreated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to save assignment:", error);
            $app.notifications.showError(
                "Error",
                isEditMode ? "Failed to update assignment" : "Failed to create assignment"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = isEditMode ? resources.editAssignmentTitle : resources.addAssignmentTitle;
    const submitLabel = isEditMode ? resources.saveButton : resources.createButton;

    return (
        <Modal opened={opened} onClose={onClose} title={title} centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Select
                        label={resources.dayLabel}
                        placeholder={resources.dayPlaceholder}
                        data={availableDays}
                        value={selectedDay}
                        onChange={(value) => {
                            setSelectedDay(value);
                            setErrors((prev) => {
                                const { day: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.day}
                        required
                        disabled={isSubmitting}
                        searchable
                    />

                    <Select
                        label={resources.slotLabel}
                        placeholder={
                            !selectedDay
                                ? "Select a day first"
                                : filteredSlots.length === 0
                                    ? "No slots for this day"
                                    : resources.slotPlaceholder
                        }
                        data={filteredSlots}
                        value={selectedSlotId}
                        onChange={(value) => {
                            setSelectedSlotId(value);
                            setErrors((prev) => {
                                const { slot: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.slot}
                        required
                        disabled={isSubmitting || !selectedDay || filteredSlots.length === 0}
                        searchable
                    />

                    <Select
                        label={resources.activityLabel}
                        placeholder={
                            activityOptions.length === 0
                                ? "No activities available"
                                : resources.activityPlaceholder
                        }
                        data={activityOptions}
                        value={selectedActivityId}
                        onChange={(value) => {
                            setSelectedActivityId(value);
                            setErrors((prev) => {
                                const { activity: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.activity}
                        required
                        disabled={isSubmitting || activityOptions.length === 0}
                        searchable
                        clearable
                    />

                    <Select
                        label={resources.resourceLabel}
                        placeholder={
                            resourceOptions.length === 0
                                ? "No resources available"
                                : resources.resourcePlaceholder
                        }
                        data={resourceOptions}
                        value={selectedResourceId}
                        onChange={(value) => {
                            setSelectedResourceId(value);
                            setErrors((prev) => {
                                const { resource: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.resource}
                        required
                        disabled={isSubmitting || resourceOptions.length === 0}
                        searchable
                        clearable
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
                            {resources.cancelButton}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {submitLabel}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
