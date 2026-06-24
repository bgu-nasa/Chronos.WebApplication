import { useEffect, useState, useMemo, useCallback } from "react";
import { Modal, Select, MultiSelect, Button, Group, Stack, Text } from "@mantine/core";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import { getWeekdaySelectOptions } from "@/common/weekdays";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { convertSlotUtcToLocal } from "@/modules/schedule/src/pages/constraints-page/utils/timezone-utils";
import resourcesJson from "../assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/assignments-page/assignments-page.resources.json",
    resourcesJson,
);
interface AddAssignmentModalProps {
    opened: boolean;
    onClose: () => void;
    slots: SlotResponse[];
    activities: EnrichedActivity[];
    resourceList: ResourceResponse[];
    weekNumOptions: { value: string; label: string }[];
    onCreated: () => void;
    editingAssignments?: AssignmentResponse[] | null;
    isAllWeeksMode?: boolean;
    fromDate?: string;
    toDate?: string;
}

function findConsecutiveSlots(
    startSlotId: string,
    count: number,
    localSlots: { slot: SlotResponse; localWeekday: string; localFromTime: string; localToTime: string }[]
): string[] | null {
    const result: string[] = [startSlotId];
    let currentSlot = localSlots.find((ls) => ls.slot.id === startSlotId);
    if (!currentSlot) return null;

    for (let i = 1; i < count; i++) {
        const nextSlot = localSlots.find(
            (ls) =>
                ls.localWeekday === currentSlot!.localWeekday &&
                ls.localFromTime === currentSlot!.localToTime
        );
        if (!nextSlot) {
            return null;
        }
        result.push(nextSlot.slot.id);
        currentSlot = nextSlot;
    }
    return result;
}

export function AddAssignmentModal({
    opened,
    onClose,
    slots,
    activities,
    resourceList,
    weekNumOptions,
    onCreated,
    editingAssignments,
    isAllWeeksMode = false,
    fromDate,
    toDate,
}: AddAssignmentModalProps) {
    const language = useLocaleStore((state) => state.language);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
    const [durationSlots, setDurationSlots] = useState<number>(1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!editingAssignments && editingAssignments.length > 0;

    const localSlots = useMemo(() => {
        return slots.map((s) => {
            const fromTime = s.fromTime.split(":").slice(0, 2).join(":");
            const toTime = s.toTime.split(":").slice(0, 2).join(":");
            const local = convertSlotUtcToLocal(s.weekday, fromTime, toTime)[0];
            return { slot: s, localWeekday: local.weekday, localFromTime: local.fromTime, localToTime: local.toTime };
        });
    }, [slots]);

    const groupedAndSortedEditingAssignments = useMemo(() => {
        if (!editingAssignments || editingAssignments.length === 0) return [];
        const byWeek: Record<string, AssignmentResponse[]> = {};
        for (const a of editingAssignments) {
            const w = a.weekNum === null ? "null" : String(a.weekNum);
            if (!byWeek[w]) byWeek[w] = [];
            byWeek[w].push(a);
        }

        const result: AssignmentResponse[][] = [];
        for (const w in byWeek) {
            const weekAssigns = byWeek[w];
            weekAssigns.sort((a, b) => {
                const slotA = localSlots.find((s) => s.slot.id === a.slotId);
                const slotB = localSlots.find((s) => s.slot.id === b.slotId);
                const timeA = slotA?.localFromTime || "";
                const timeB = slotB?.localFromTime || "";
                return timeA.localeCompare(timeB);
            });
            result.push(weekAssigns);
        }
        return result;
    }, [editingAssignments, localSlots]);

    const editingConsecutiveCount = useMemo(() => {
        return groupedAndSortedEditingAssignments[0]?.length || 0;
    }, [groupedAndSortedEditingAssignments]);

    const semesterStart = useMemo(() => {
        if (!fromDate) return null;
        const match = fromDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
        let date: Date;
        if (match) {
            date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        } else {
            date = new Date(fromDate);
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }, [fromDate]);

    const semesterEnd = useMemo(() => {
        if (!toDate) return null;
        const match = toDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
        let date: Date;
        if (match) {
            date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        } else {
            date = new Date(toDate);
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }, [toDate]);

    const checkDateValid = useCallback((wNum: number, dayName: string | null) => {
        if (!semesterStart || !semesterEnd || !dayName) return { isValid: true };

        const startDayIndex = semesterStart.getDay();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const normalized = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
        const targetDayIndex = weekdays.indexOf(normalized);
        if (targetDayIndex === -1) return { isValid: true };

        const dayOffset = (targetDayIndex - startDayIndex + 7) % 7;
        const actualDate = new Date(semesterStart);
        actualDate.setDate(semesterStart.getDate() + (wNum - 1) * 7 + dayOffset);
        actualDate.setHours(0, 0, 0, 0);

        const isValid = actualDate >= semesterStart && actualDate <= semesterEnd;
        
        const formatDateStr = (date: Date) => {
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        };

        return {
            isValid,
            dateStr: formatDateStr(actualDate),
            actualDate
        };
    }, [semesterStart, semesterEnd]);

    const validationStatus = useMemo(() => {
        if (!selectedDay || !fromDate || !toDate) return { validWeeks: [], invalidWeeks: [] };

        const validWeeks: { weekNum: number; dateStr: string }[] = [];
        const invalidWeeks: { weekNum: number; dateStr: string }[] = [];

        for (const wStr of selectedWeeks) {
            const wNum = Number(wStr);
            const check = checkDateValid(wNum, selectedDay);
            if (check.isValid) {
                validWeeks.push({ weekNum: wNum, dateStr: check.dateStr! });
            } else {
                invalidWeeks.push({ weekNum: wNum, dateStr: check.dateStr! });
            }
        }

        return { validWeeks, invalidWeeks };
    }, [selectedDay, fromDate, toDate, selectedWeeks, checkDateValid]);

    const weekNumOptionsWithDates = useMemo(() => {
        if (!selectedDay) return weekNumOptions;
        return weekNumOptions.map((opt) => {
            const wNum = Number(opt.value);
            const check = checkDateValid(wNum, selectedDay);
            if (check.dateStr) {
                return {
                    value: opt.value,
                    label: `${opt.label} (${check.dateStr})`,
                };
            }
            return opt;
        });
    }, [weekNumOptions, selectedDay, checkDateValid]);

    const availableDays = useMemo(() => {
        const daysWithSlots = new Set(localSlots.map((s) => s.localWeekday));
        return getWeekdaySelectOptions().filter((option) =>
            daysWithSlots.has(option.value),
        );
    }, [localSlots, language]);

    const filteredSlots = useMemo(() => {
        if (!selectedDay) return [];
        const sorted = localSlots
            .filter((s) => s.localWeekday === selectedDay)
            .sort((a, b) => a.localFromTime.localeCompare(b.localFromTime));

        return sorted.map((s) => {
            if (durationSlots > 1) {
                const consecutive = findConsecutiveSlots(s.slot.id, durationSlots, localSlots);
                if (consecutive) {
                    const lastId = consecutive.at(-1)!;
                    const lastLocal = localSlots.find((ls) => ls.slot.id === lastId);
                    const toTime = lastLocal ? lastLocal.localToTime : s.localToTime;
                    return {
                        value: s.slot.id,
                        label: `${s.localFromTime} - ${toTime}`,
                    };
                } else {
                    return {
                        value: s.slot.id,
                        label: `${s.localFromTime} - ${s.localToTime} (Not enough consecutive slots)`,
                        disabled: true,
                    };
                }
            } else {
                return {
                    value: s.slot.id,
                    label: `${s.localFromTime} - ${s.localToTime}`,
                };
            }
        });
    }, [selectedDay, localSlots, durationSlots]);

    const slotPlaceholder = useMemo(() => {
        if (!selectedDay) return resources.selectDayFirst;
        if (filteredSlots.length === 0) return resources.noSlotsForDay;
        return resources.slotPlaceholder;
    }, [selectedDay, filteredSlots.length, resources]);

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
            if (isEditMode && editingAssignments && editingAssignments.length > 0) {
                const refAssign = groupedAndSortedEditingAssignments[0]?.[0];
                if (refAssign) {
                    const localSlot = localSlots.find((s) => s.slot.id === refAssign.slotId);
                    setSelectedDay(localSlot?.localWeekday || null);
                    setSelectedSlotId(refAssign.slotId);
                    setSelectedActivityId(refAssign.activityId);
                    setSelectedResourceId(refAssign.resourceId);
                    const editWeeks = groupedAndSortedEditingAssignments
                        .map((wa) => wa[0]?.weekNum)
                        .filter((w): w is number => w !== null)
                        .map(String);
                    setSelectedWeeks(editWeeks);
                    setDurationSlots(editingConsecutiveCount);
                }
            } else {
                setSelectedDay(null);
                setSelectedSlotId(null);
                setSelectedActivityId(null);
                setSelectedResourceId(null);
                setSelectedWeeks([]);
                setDurationSlots(1);
            }
        }
    }, [opened, editingAssignments, groupedAndSortedEditingAssignments, editingConsecutiveCount]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedDay) newErrors.day = "Day is required";
        if (!selectedSlotId) newErrors.slot = "Slot is required";
        if (!selectedActivityId) newErrors.activity = "Activity is required";
        if (!selectedResourceId) newErrors.resource = "Resource is required";

        if (selectedSlotId && durationSlots > 1) {
            const consecutiveIds = findConsecutiveSlots(selectedSlotId, durationSlots, localSlots);
            if (!consecutiveIds) {
                newErrors.slot = `This selection requires ${durationSlots} consecutive slots. Not enough consecutive slots are available starting from the selected slot.`;
            }
        }

        // Date validation: ensure the assignment date falls within the semester start & end dates
        if (selectedDay) {
            if (fromDate && toDate) {
                const { validWeeks, invalidWeeks } = validationStatus;

                const formatDateStr = (date: Date) => {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                };

                const parseDateString = (dateStr: string) => {
                    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    let date: Date;
                    if (match) {
                        date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
                    } else {
                        date = new Date(dateStr);
                    }
                    date.setHours(0, 0, 0, 0);
                    return date;
                };

                const semesterStart = parseDateString(fromDate);
                const semesterEnd = parseDateString(toDate);

                if (selectedWeeks.length === 0) {
                    newErrors.selectedWeeks = "At least one week is required";
                } else if (validWeeks.length === 0 && invalidWeeks.length > 0) {
                    newErrors.selectedWeeks = `All selected weeks fall outside the semester dates (${formatDateStr(semesterStart)} - ${formatDateStr(semesterEnd)}).`;
                }
            } else if (selectedWeeks.length === 0) {
                newErrors.selectedWeeks = "At least one week is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const consecutiveIds = findConsecutiveSlots(selectedSlotId!, durationSlots, localSlots);
            if (!consecutiveIds) {
                throw new Error("Invalid slots configuration");
            }

            const targetWeeks = validationStatus.validWeeks.map((vw) => vw.weekNum);

            if (isEditMode && editingAssignments && editingAssignments.length > 0) {
                const originalWeeks = groupedAndSortedEditingAssignments
                    .map((wa) => wa[0]?.weekNum)
                    .filter((w): w is number => w !== null);

                const originalAssignmentsByWeek: Record<number, AssignmentResponse[]> = {};
                for (const wa of groupedAndSortedEditingAssignments) {
                    const w = wa[0]?.weekNum;
                    if (w !== null && w !== undefined) {
                        originalAssignmentsByWeek[w] = wa;
                    }
                }

                // Delete original assignments for any weeks that are no longer selected (or are invalid)
                const weeksToDelete = originalWeeks.filter((w) => !targetWeeks.includes(w));
                for (const w of weeksToDelete) {
                    const assigns = originalAssignmentsByWeek[w] || [];
                    for (const assign of assigns) {
                        await assignmentDataRepository.deleteAssignment(assign.id);
                    }
                }

                // Delete any original assignments that have weekNum === null
                const nullWeekAssigns = groupedAndSortedEditingAssignments.find(
                    (wa) => wa[0]?.weekNum === null
                );
                if (nullWeekAssigns) {
                    for (const assign of nullWeekAssigns) {
                        await assignmentDataRepository.deleteAssignment(assign.id);
                    }
                }

                // Update weeks that are kept
                const weeksToUpdate = originalWeeks.filter((w) => targetWeeks.includes(w));
                for (const w of weeksToUpdate) {
                    const weekAssigns = originalAssignmentsByWeek[w] || [];
                    const N = weekAssigns.length;
                    const M = durationSlots;

                    const limit = Math.min(N, M);
                    for (let i = 0; i < limit; i++) {
                        await assignmentDataRepository.updateAssignment(weekAssigns[i].id, {
                            slotId: consecutiveIds[i],
                            resourceId: selectedResourceId!,
                            activityId: selectedActivityId!,
                            weekNum: w,
                        });
                    }

                    if (M < N) {
                        for (let i = M; i < N; i++) {
                            await assignmentDataRepository.deleteAssignment(weekAssigns[i].id);
                        }
                    }

                    if (M > N) {
                        for (let i = N; i < M; i++) {
                            await assignmentDataRepository.createAssignment({
                                slotId: consecutiveIds[i],
                                resourceId: selectedResourceId!,
                                activityId: selectedActivityId!,
                                weekNum: w,
                            });
                        }
                    }
                }

                // Create assignments for newly added weeks
                const weeksToCreate = targetWeeks.filter((w) => !originalWeeks.includes(w));
                for (const w of weeksToCreate) {
                    for (let i = 0; i < durationSlots; i++) {
                        await assignmentDataRepository.createAssignment({
                            slotId: consecutiveIds[i],
                            resourceId: selectedResourceId!,
                            activityId: selectedActivityId!,
                            weekNum: w,
                        });
                    }
                }

                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.updateSuccess,
                );
            } else {
                // Create Mode: Create assignments for all target weeks sequentially
                for (const w of targetWeeks) {
                    for (const slotId of consecutiveIds) {
                        await assignmentDataRepository.createAssignment({
                            slotId,
                            resourceId: selectedResourceId!,
                            activityId: selectedActivityId!,
                            weekNum: w,
                        });
                    }
                }

                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.createSuccess,
                );
            }
            onCreated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to save assignment:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                isEditMode ? resources.notifications.updateError : resources.notifications.createError,
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
                            setSelectedSlotId(null);
                            setErrors((prev) => {
                                const { day: _, slot: __, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.day}
                        required
                        disabled={isSubmitting}
                        searchable
                    />

                    <Select
                        label={resources.durationLabel || "Duration"}
                        placeholder={resources.durationPlaceholder || "Select duration"}
                        data={[
                            { value: "1", label: resources.durationOptions?.["1"] || "1 Slot" },
                            { value: "2", label: resources.durationOptions?.["2"] || "2 Slots" },
                            { value: "3", label: resources.durationOptions?.["3"] || "3 Slots" },
                            { value: "4", label: resources.durationOptions?.["4"] || "4 Slots" },
                            { value: "5", label: resources.durationOptions?.["5"] || "5 Slots" },
                            { value: "6", label: resources.durationOptions?.["6"] || "6 Slots" },
                            { value: "7", label: resources.durationOptions?.["7"] || "7 Slots" },
                            { value: "8", label: resources.durationOptions?.["8"] || "8 Slots" },
                        ]}
                        value={String(durationSlots)}
                        onChange={(value) => {
                            setDurationSlots(value ? Number(value) : 1);
                        }}
                        disabled={isSubmitting}
                        required
                    />

                    <Select
                        label={resources.slotLabel}
                        placeholder={slotPlaceholder}
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

                    <MultiSelect
                        label={resources.weekNumLabel}
                        placeholder={
                            selectedDay
                                ? resources.weekNumFilterPlaceholder
                                : resources.selectDayFirst
                        }
                        data={weekNumOptionsWithDates}
                        value={selectedWeeks}
                        onChange={(value: any) => {
                            setSelectedWeeks(value);
                            setErrors((prev) => {
                                const { selectedWeeks: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.selectedWeeks}
                        disabled={isSubmitting || !selectedDay || weekNumOptionsWithDates.length === 0}
                        searchable
                        clearable
                    />

                    <Select
                        label={resources.activityLabel}
                        placeholder={
                            activityOptions.length === 0
                                ? resources.noActivitiesAvailable
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

                    {validationStatus.invalidWeeks.length > 0 && validationStatus.validWeeks.length > 0 && (
                        <Text
                            size="sm"
                            c="yellow.8"
                            bg="yellow.0"
                            p="xs"
                            style={{
                                borderRadius: "4px",
                                border: "1px solid var(--mantine-color-yellow-3)",
                            }}
                        >
                            Warning: The assignment in the following week(s) falls outside the semester dates and will not be created/updated:{" "}
                            {validationStatus.invalidWeeks.map((iw) => `${iw.dateStr} (Week ${iw.weekNum})`).join(", ")}
                        </Text>
                    )}

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
