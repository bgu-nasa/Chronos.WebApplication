import { useEffect, useState, useMemo, useCallback } from "react";
import { Modal, TextInput, Textarea, Button, Group, Stack, Radio, MultiSelect } from "@mantine/core";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { $app } from "@/infra/service";
import resourcesJson from "../my-assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/my-assignments-page/my-assignments-page.resources.json",
    resourcesJson,
);

interface CreateAppealModalProps {
    opened: boolean;
    onClose: () => void;
    selectedGroup: {
        weeks: (number | null)[];
        assignments: AssignmentResponse[];
        localWeekday: string;
    } | null;
    fromDate?: string;
    toDate?: string;
    onCreated: () => void;
}

export function CreateAppealModal({
    opened,
    onClose,
    selectedGroup,
    fromDate,
    toDate,
    onCreated,
}: CreateAppealModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [appealMode, setAppealMode] = useState<string>("all");
    const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (opened) {
            setTitle("");
            setDescription("");
            setAppealMode("all");
            setSelectedWeeks([]);
            setErrors({});
        }
    }, [opened]);

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

    const weeksList = useMemo(() => {
        if (!selectedGroup) return [];
        return selectedGroup.weeks
            .filter((w): w is number => w !== null)
            .sort((a, b) => a - b);
    }, [selectedGroup]);

    const weekNumOptions = useMemo(() => {
        if (!selectedGroup) return [];
        return weeksList.map((w) => {
            const check = checkDateValid(w, selectedGroup.localWeekday);
            const dateSuffix = check.dateStr ? ` (${check.dateStr})` : "";
            return {
                value: String(w),
                label: `${w}${dateSuffix}`,
            };
        });
    }, [weeksList, selectedGroup, checkDateValid]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = resources.createAppealModal.titleRequired;
        if (!description.trim()) newErrors.description = resources.createAppealModal.descriptionRequired;
        if (weeksList.length > 1 && appealMode === "weeks" && selectedWeeks.length === 0) {
            newErrors.weeks = resources.createAppealModal.weeksRequired;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !selectedGroup) return;

        setIsSubmitting(true);
        try {
            const targetAssignments = selectedGroup.assignments.filter((a) => {
                if (weeksList.length <= 1) return true;
                if (appealMode === "all") return true;
                if (a.weekNum === null) return false;
                return selectedWeeks.includes(String(a.weekNum));
            });

            if (targetAssignments.length === 0) {
                setErrors({ weeks: resources.createAppealModal.weeksRequired });
                setIsSubmitting(false);
                return;
            }

            for (const a of targetAssignments) {
                await appealDataRepository.createAppeal({
                    assignmentId: a.id,
                    title: title.trim(),
                    description: description.trim(),
                });
            }

            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.appealCreateSuccess,
            );
            onCreated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to create appeal:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.appealCreateError,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={resources.createAppealModal.title} centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {weeksList.length > 1 && (
                        <Radio.Group
                            label={resources.createAppealModal.appealModeLabel}
                            value={appealMode}
                            onChange={(value) => {
                                setAppealMode(value);
                                setErrors((prev) => {
                                    const { weeks: _, ...rest } = prev;
                                    return rest;
                                });
                            }}
                            required
                        >
                            <Stack gap="xs" mt="xs">
                                <Radio value="all" label={resources.createAppealModal.appealAllWeeksLabel} disabled={isSubmitting} />
                                <Radio value="weeks" label={resources.createAppealModal.appealSelectedWeeksLabel} disabled={isSubmitting} />
                            </Stack>
                        </Radio.Group>
                    )}

                    {weeksList.length > 1 && appealMode === "weeks" && (
                        <MultiSelect
                            label={resources.createAppealModal.weeksLabel}
                            placeholder={resources.createAppealModal.weeksPlaceholder}
                            data={weekNumOptions}
                            value={selectedWeeks}
                            onChange={(value) => {
                                setSelectedWeeks(value);
                                setErrors((prev) => {
                                    const { weeks: _, ...rest } = prev;
                                    return rest;
                                });
                            }}
                            error={errors.weeks}
                            required
                            disabled={isSubmitting}
                        />
                    )}

                    <TextInput
                        label={resources.createAppealModal.titleLabel}
                        placeholder={resources.createAppealModal.titlePlaceholder}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.currentTarget.value);
                            setErrors((prev) => {
                                const { title: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.title}
                        required
                        disabled={isSubmitting}
                    />

                    <Textarea
                        label={resources.createAppealModal.descriptionLabel}
                        placeholder={resources.createAppealModal.descriptionPlaceholder}
                        value={description}
                        onChange={(e) => {
                            setDescription(e.currentTarget.value);
                            setErrors((prev) => {
                                const { description: _, ...rest } = prev;
                                return rest;
                            });
                        }}
                        error={errors.description}
                        required
                        disabled={isSubmitting}
                        minRows={4}
                        autosize
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
                            {resources.createAppealModal.cancelButton}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {resources.createAppealModal.submitButton}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

