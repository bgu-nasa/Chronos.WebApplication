import { useEffect, useMemo, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";

import { ActionIcon, Button, Group, Modal, MultiSelect, Select, Stack, Text, TextInput } from "@mantine/core";
import { TimeInput } from "@mantine/dates";

import { useUsers } from "@/modules/auth/src/hooks";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks";

import resources from "../constraints-page.resources.json";
import {
    parseForbiddenTimeRange,
    parsePreferredTimeRange,
    parsePreferredWeekdays,
    serializeForbiddenTimeRange,
    serializePreferredTimeRange,
    serializePreferredWeekdays,
    type ForbiddenTimeRangeEntry,
} from "../utils";

type ConstraintMode = "repeated" | "oneTime";

interface UserConstraintEditorSubmitData {
    userId: string;
    schedulingPeriodId: string;
    key: string;
    value: string;
    weekNum: number | null;
    isPreference: boolean;
}

interface UserConstraintEditorProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: UserConstraintEditorSubmitData) => Promise<void>;
    readonly initialData?: {
        userId: string;
        schedulingPeriodId: string;
        key: string;
        value: string;
        weekNum?: number | null;
        isPreference: boolean;
    };
    readonly isAdmin: boolean;
    readonly currentUserId?: string;
    readonly loading?: boolean;
    readonly isPreference: boolean;
}

const weekdays = resources.other.weekdays;

function normalizeWeekday(weekday: string) {
    if (!weekday) {
        return weekday;
    }

    return weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
}

function createDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getWeekdayFromDateKey(dateKey: string) {
    if (!dateKey) {
        return "";
    }

    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return weekdays[date.getDay()] || "";
}

function getIsoWeekNumber(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = (utcDate.getUTCDay() + 6) % 7;
    utcDate.setUTCDate(utcDate.getUTCDate() - dayNumber + 3);

    const firstThursday = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 4));
    const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

    return 1 + Math.round((utcDate.getTime() - firstThursday.getTime()) / 604800000);
}

function getDateFromIsoWeek(year: number, weekNum: number, weekday: string) {
    const normalizedWeekday = normalizeWeekday(weekday);
    const weekdayIndex = weekdays.indexOf(normalizedWeekday);
    if (weekdayIndex < 0) {
        return "";
    }

    const week1Thursday = new Date(Date.UTC(year, 0, 4));
    const week1ThursdayDayNumber = (week1Thursday.getUTCDay() + 6) % 7;
    week1Thursday.setUTCDate(week1Thursday.getUTCDate() - week1ThursdayDayNumber + 3);

    const isoWeekdayOffset = (weekdayIndex + 6) % 7;
    const date = new Date(week1Thursday);
    date.setUTCDate(week1Thursday.getUTCDate() + (weekNum - 1) * 7 + isoWeekdayOffset - 3);

    return createDateKey(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function createEmptyTimeRangeEntry(): ForbiddenTimeRangeEntry & { id: string } {
    return {
        weekday: "",
        startTime: "",
        endTime: "",
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
}

function getMinutesFromTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function isValidTimeRange(entry: Pick<ForbiddenTimeRangeEntry, "startTime" | "endTime">) {
    return getMinutesFromTime(entry.startTime) < getMinutesFromTime(entry.endTime);
}

function validateRepeatedForbiddenTimeRanges(entries: Array<ForbiddenTimeRangeEntry>): string | null {
    const validEntries = entries.filter(entry => entry.weekday && entry.startTime && entry.endTime);

    if (validEntries.length === 0) {
        return resources.validationMessages.atLeastOneTimeRange;
    }

    return validEntries.some(entry => !isValidTimeRange(entry))
        ? resources.validationMessages.startTimeBeforeEndTime
        : null;
}

function validateOneTimeForbiddenTimeRange(
    entries: Array<ForbiddenTimeRangeEntry>,
    oneTimeDate: string,
    selectedSchedulingPeriod?: { fromDate: string; toDate: string }
): { value?: string; date?: string } | null {
    if (!oneTimeDate) {
        return { date: resources.validationMessages.oneTimeDateRequired };
    }

    if (!selectedSchedulingPeriod) {
        return { date: resources.validationMessages.schedulingPeriodRequired };
    }

    const periodStartKey = selectedSchedulingPeriod.fromDate.split("T")[0];
    const periodEndKey = selectedSchedulingPeriod.toDate.split("T")[0];

    if (oneTimeDate < periodStartKey || oneTimeDate > periodEndKey) {
        return { date: resources.validationMessages.oneTimeDateOutOfRange };
    }

    const validEntries = entries.filter(entry => entry.startTime && entry.endTime);

    if (validEntries.length !== 1) {
        return { value: resources.validationMessages.atLeastOneTimeRange };
    }

    return isValidTimeRange(validEntries[0])
        ? null
        : { value: resources.validationMessages.startTimeBeforeEndTime };
}

function serializeConstraintValue(
    key: string,
    constraintMode: ConstraintMode,
    timeRangeEntries: Array<ForbiddenTimeRangeEntry & { id: string }>,
    oneTimeDate: string,
    selectedWeekdays: string[]
) {
    if (key === "forbidden_timerange") {
        const entriesWithoutIds = timeRangeEntries.map(({ id, ...entry }) => entry);

        if (constraintMode === "oneTime") {
            const entry = entriesWithoutIds[0];

            return {
                serializedValue: serializeForbiddenTimeRange([
                    {
                        weekday: getWeekdayFromDateKey(oneTimeDate) || entry?.weekday || "",
                        startTime: entry?.startTime || "",
                        endTime: entry?.endTime || "",
                    },
                ]),
                weekNum: getIsoWeekNumber(oneTimeDate),
            };
        }

        return {
            serializedValue: serializeForbiddenTimeRange(entriesWithoutIds),
            weekNum: null,
        };
    }

    if (key === "preferred_timerange") {
        const entriesWithoutIds = timeRangeEntries.map(({ id, ...entry }) => entry);
        return {
            serializedValue: serializePreferredTimeRange(entriesWithoutIds),
            weekNum: null,
        };
    }

    return {
        serializedValue: serializePreferredWeekdays(selectedWeekdays),
        weekNum: null,
    };
}

export function UserConstraintEditor({
    opened,
    onClose,
    onSubmit,
    initialData,
    isAdmin,
    currentUserId,
    loading = false,
    isPreference,
}: UserConstraintEditorProps) {
    const { users, fetchUsers } = useUsers();
    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();

    const [timeRangeEntries, setTimeRangeEntries] = useState<Array<ForbiddenTimeRangeEntry & { id: string }>>([]);
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
    const [constraintMode, setConstraintMode] = useState<ConstraintMode>("repeated");
    const [oneTimeDate, setOneTimeDate] = useState<string>("");

    const defaultConstraintKey = isPreference ? "preferred_weekdays" : "forbidden_timerange";

    const [formValues, setFormValues] = useState({
        userId: initialData?.userId || currentUserId || "",
        schedulingPeriodId: initialData?.schedulingPeriodId || "",
        key: initialData?.key || defaultConstraintKey,
        isPreference: initialData?.isPreference ?? isPreference,
    });

    const constraintKey = useMemo(() => {
        if (initialData?.key) {
            return initialData.key;
        }

        return formValues.key || defaultConstraintKey;
    }, [initialData?.key, formValues.key, defaultConstraintKey]);

    const constraintTypeOptions = useMemo(() => {
        return isPreference
            ? resources.constraintTypeOptions.userPreferences
            : resources.constraintTypeOptions.userConstraints;
    }, [isPreference]);

    const constraintTypeLabel = useMemo(() => {
        return constraintTypeOptions.find((opt) => opt.value === constraintKey)?.label || constraintKey;
    }, [constraintKey, constraintTypeOptions]);

    const selectedSchedulingPeriod = useMemo(
        () => schedulingPeriods.find(period => period.id === formValues.schedulingPeriodId),
        [schedulingPeriods, formValues.schedulingPeriodId]
    );

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const isOneTimeForbiddenEdit = Boolean(
        initialData?.key === "forbidden_timerange" &&
        initialData.weekNum !== null &&
        initialData.weekNum !== undefined
    );

    useEffect(() => {
        if (opened) {
            fetchUsers();
            fetchSchedulingPeriods();
        }
    }, [opened, fetchUsers, fetchSchedulingPeriods]);

    const initializeEditData = () => {
        if (!initialData) return;

        setFormValues({
            userId: initialData.userId,
            schedulingPeriodId: initialData.schedulingPeriodId,
            key: initialData.key,
            isPreference: initialData.isPreference,
        });
        setFormErrors({});
        setConstraintMode(isOneTimeForbiddenEdit ? "oneTime" : "repeated");

        if (initialData.key === "forbidden_timerange" || initialData.key === "preferred_timerange") {
            const entries = initialData.key === "forbidden_timerange"
                ? parseForbiddenTimeRange(initialData.value)
                : parsePreferredTimeRange(initialData.value);

            const entriesWithIds = entries.length > 0
                ? entries.map(entry => ({ ...entry, id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 11)}` }))
                : [createEmptyTimeRangeEntry()];

            setTimeRangeEntries(entriesWithIds);
            setOneTimeDate("");
        } else if (initialData.key === "preferred_weekdays") {
            setSelectedWeekdays(parsePreferredWeekdays(initialData.value));
        }
    };

    useEffect(() => {
        if (!opened || !initialData || !isOneTimeForbiddenEdit) {
            return;
        }

        const selectedPeriod = schedulingPeriods.find(period => period.id === initialData.schedulingPeriodId);
        if (!selectedPeriod) {
            return;
        }

        const parsedEntries = parseForbiddenTimeRange(initialData.value);
        const firstEntry = parsedEntries[0];

        if (!firstEntry || oneTimeDate) {
            return;
        }

        const year = new Date(selectedPeriod.fromDate).getFullYear();
        setOneTimeDate(getDateFromIsoWeek(year, initialData.weekNum!, firstEntry.weekday));
    }, [opened, initialData, isOneTimeForbiddenEdit, schedulingPeriods, oneTimeDate]);

    const initializeNewData = () => {
        setFormValues({
            userId: !isAdmin && currentUserId ? currentUserId : "",
            schedulingPeriodId: "",
            key: constraintKey,
            isPreference,
        });
        setFormErrors({});
        setConstraintMode("repeated");
        setOneTimeDate("");

        if (constraintKey === "forbidden_timerange" || constraintKey === "preferred_timerange") {
            setTimeRangeEntries([createEmptyTimeRangeEntry()]);
        } else if (constraintKey === "preferred_weekdays") {
            setSelectedWeekdays([]);
        }
    };

    useEffect(() => {
        if (opened) {
            if (initialData) {
                initializeEditData();
            } else {
                initializeNewData();
            }
        }
    }, [opened, initialData, isAdmin, currentUserId, isPreference, constraintKey]);

    const validateForm = (): { value?: string; date?: string } | null => {
        if (constraintKey === "forbidden_timerange") {
            if (constraintMode === "oneTime") {
                return validateOneTimeForbiddenTimeRange(timeRangeEntries, oneTimeDate, selectedSchedulingPeriod);
            }

            const validationMessage = validateRepeatedForbiddenTimeRanges(timeRangeEntries);
            return validationMessage ? { value: validationMessage } : null;
        }

        if (constraintKey === "preferred_weekdays" && selectedWeekdays.length === 0) {
            return { value: resources.validationMessages.atLeastOneWeekday };
        }

        return null;
    };

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!formValues.userId) {
            errors.userId = resources.validationMessages.userRequired;
        }

        if (!formValues.schedulingPeriodId) {
            errors.schedulingPeriodId = resources.validationMessages.schedulingPeriodRequired;
        }

        const validationErrors = validateForm();
        if (validationErrors?.value) {
            errors.value = validationErrors.value;
        }
        if (validationErrors?.date) {
            errors.oneTimeDate = validationErrors.date;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const { serializedValue, weekNum } = serializeConstraintValue(
                constraintKey,
                constraintMode,
                timeRangeEntries,
                oneTimeDate,
                selectedWeekdays
            );

            await onSubmit({
                ...formValues,
                value: serializedValue,
                weekNum,
                isPreference: initialData?.isPreference ?? isPreference,
            });

            setFormValues({
                userId: !isAdmin && currentUserId ? currentUserId : "",
                schedulingPeriodId: "",
                key: constraintKey,
                isPreference,
            });
            setFormErrors({});
            setConstraintMode("repeated");
            setOneTimeDate("");
            setTimeRangeEntries([]);
            setSelectedWeekdays([]);
            onClose();
        } catch (error) {
            $app.logger.error("[UserConstraintEditor] Error submitting constraint:", error);
            $app.notifications.showError(
                resources.notifications.userConstraints.failedToSaveConstraint,
                error instanceof Error ? error.message : resources.notifications.userConstraints.unexpectedError
            );
        }
    };

    const addTimeRangeEntry = () => {
        setTimeRangeEntries([...timeRangeEntries, createEmptyTimeRangeEntry()]);
    };

    const removeTimeRangeEntry = (id: string) => {
        setTimeRangeEntries(timeRangeEntries.filter(entry => entry.id !== id));
    };

    const updateTimeRangeEntry = (id: string, field: keyof ForbiddenTimeRangeEntry, value: string) => {
        setTimeRangeEntries(timeRangeEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit();
    };

    const userOptions = users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
    }));

    const periodOptions = schedulingPeriods.map((period) => ({
        value: period.id,
        label: period.name,
    }));

    let modalTitle = resources.modalTitles.createUserConstraint;
    if (initialData) {
        modalTitle = isPreference ? resources.modalTitles.editUserPreference : resources.modalTitles.editUserConstraint;
    } else if (isPreference) {
        modalTitle = resources.modalTitles.createUserPreference;
    }

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} size={resources.modalSize}>
            <form onSubmit={handleFormSubmit}>
                {isAdmin ? (
                    <Select
                        label={resources.labels.user}
                        placeholder={resources.placeholders.selectUser}
                        data={userOptions}
                        searchable
                        required
                        mb="md"
                        value={formValues.userId}
                        onChange={(value) => {
                            setFormValues({ ...formValues, userId: value || "" });
                            if (formErrors.userId) {
                                setFormErrors({ ...formErrors, userId: "" });
                            }
                        }}
                        error={formErrors.userId}
                    />
                ) : (
                    <TextInput
                        label={resources.labels.user}
                        value={(() => {
                            const user = users.find((u) => u.id === currentUserId);
                            return user ? `${user.firstName} ${user.lastName}` : resources.other.currentUser;
                        })()}
                        disabled
                        mb="md"
                    />
                )}

                <Select
                    label={resources.labels.schedulingPeriod}
                    placeholder={resources.placeholders.selectSchedulingPeriod}
                    data={periodOptions}
                    searchable
                    required
                    mb="md"
                    value={formValues.schedulingPeriodId}
                    onChange={(value) => {
                        setFormValues({ ...formValues, schedulingPeriodId: value || "" });
                        if (formErrors.schedulingPeriodId) {
                            setFormErrors({ ...formErrors, schedulingPeriodId: "" });
                        }
                    }}
                    error={formErrors.schedulingPeriodId}
                />

                {initialData ? (
                    <TextInput
                        label={resources.labels.key}
                        value={constraintTypeLabel}
                        disabled
                        mb="md"
                    />
                ) : (
                    <Select
                        label={resources.labels.key}
                        placeholder={resources.placeholders.selectConstraintType}
                        data={constraintTypeOptions}
                        value={constraintKey}
                        onChange={(value) => {
                            if (!value) {
                                return;
                            }

                            setFormValues({ ...formValues, key: value });
                            if (value === "forbidden_timerange" || value === "preferred_timerange") {
                                setTimeRangeEntries([createEmptyTimeRangeEntry()]);
                                setSelectedWeekdays([]);
                                setConstraintMode("repeated");
                                setOneTimeDate("");
                            } else if (value === "preferred_weekdays") {
                                setTimeRangeEntries([]);
                                setSelectedWeekdays([]);
                            }

                            if (formErrors.value) {
                                setFormErrors({ ...formErrors, value: "" });
                            }
                        }}
                        mb="md"
                    />
                )}

                {constraintKey === "forbidden_timerange" && (
                    <Stack gap="md" mb="md">
                        <Select
                            label={resources.labels.constraintMode}
                            data={resources.constraintModes}
                            value={constraintMode}
                            onChange={(value) => {
                                const nextMode = (value as ConstraintMode) || "repeated";
                                setConstraintMode(nextMode);
                                setFormErrors({ ...formErrors, value: "", oneTimeDate: "" });

                                const firstEntry = timeRangeEntries[0] ?? createEmptyTimeRangeEntry();
                                setTimeRangeEntries([
                                    {
                                        ...firstEntry,
                                        weekday: nextMode === "oneTime" && oneTimeDate
                                            ? getWeekdayFromDateKey(oneTimeDate)
                                            : firstEntry.weekday,
                                    },
                                ]);
                            }}
                        />

                        {constraintMode === "oneTime" && (
                            <TextInput
                                label={resources.labels.date}
                                placeholder={resources.placeholders.selectDate}
                                type="date"
                                value={oneTimeDate}
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setOneTimeDate(value);
                                    setFormErrors({ ...formErrors, oneTimeDate: "" });
                                    setTimeRangeEntries(previousEntries => {
                                        const firstEntry = previousEntries[0] ?? createEmptyTimeRangeEntry();
                                        return [{ ...firstEntry, weekday: getWeekdayFromDateKey(value) }];
                                    });
                                }}
                                error={formErrors.oneTimeDate}
                                required
                            />
                        )}

                        <Text size="sm" c="dimmed">
                            {constraintMode === "oneTime"
                                ? resources.valueFormatGuidance.forbidden_timerange_oneTime
                                : resources.valueFormatGuidance.forbidden_timerange}
                        </Text>

                        {formErrors.value && (
                            <Text size="sm" c="red" mb="xs">
                                {formErrors.value}
                            </Text>
                        )}

                        {timeRangeEntries.map((entry, index) => (
                            <Group key={entry.id} align="flex-start" gap="xs">
                                {constraintMode === "repeated" && (
                                    <Select
                                        label={index === 0 ? resources.labels.weekday : undefined}
                                        placeholder={resources.placeholders.selectWeekday}
                                        data={resources.other.weekdays}
                                        value={entry.weekday}
                                        onChange={(value) => updateTimeRangeEntry(entry.id, "weekday", value || "")}
                                        style={{ flex: 1 }}
                                        required
                                    />
                                )}
                                <TimeInput
                                    label={index === 0 ? resources.labels.startTime : undefined}
                                    placeholder={resources.placeholders.selectStartTime}
                                    value={entry.startTime}
                                    onChange={(e) => updateTimeRangeEntry(entry.id, "startTime", e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <TimeInput
                                    label={index === 0 ? resources.labels.endTime : undefined}
                                    placeholder={resources.placeholders.selectEndTime}
                                    value={entry.endTime}
                                    onChange={(e) => updateTimeRangeEntry(entry.id, "endTime", e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                    required
                                />
                                {constraintMode === "repeated" && timeRangeEntries.length > 1 && (
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() => removeTimeRangeEntry(entry.id)}
                                        mt={index === 0 ? 28 : 0}
                                    >
                                        <HiOutlineTrash size={16} />
                                    </ActionIcon>
                                )}
                            </Group>
                        ))}

                        {constraintMode === "repeated" && (
                            <Button variant="light" onClick={addTimeRangeEntry} size="sm">
                                {resources.labels.addTimeRange}
                            </Button>
                        )}
                    </Stack>
                )}

                {constraintKey === "preferred_timerange" && (
                    <Stack gap="md" mb="md">
                        {formErrors.value && (
                            <Text size="sm" c="red" mb="xs">
                                {formErrors.value}
                            </Text>
                        )}
                        {timeRangeEntries.map((entry, index) => (
                            <Group key={entry.id} align="flex-start" gap="xs">
                                <Select
                                    label={index === 0 ? resources.labels.weekday : undefined}
                                    placeholder={resources.placeholders.selectWeekday}
                                    data={resources.other.weekdays}
                                    value={entry.weekday}
                                    onChange={(value) => updateTimeRangeEntry(entry.id, "weekday", value || "")}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <TimeInput
                                    label={index === 0 ? resources.labels.startTime : undefined}
                                    placeholder={resources.placeholders.selectStartTime}
                                    value={entry.startTime}
                                    onChange={(e) => updateTimeRangeEntry(entry.id, "startTime", e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                    required
                                />
                                <TimeInput
                                    label={index === 0 ? resources.labels.endTime : undefined}
                                    placeholder={resources.placeholders.selectEndTime}
                                    value={entry.endTime}
                                    onChange={(e) => updateTimeRangeEntry(entry.id, "endTime", e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                    required
                                />
                                {timeRangeEntries.length > 1 && (
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() => removeTimeRangeEntry(entry.id)}
                                        mt={index === 0 ? 28 : 0}
                                    >
                                        <HiOutlineTrash size={16} />
                                    </ActionIcon>
                                )}
                            </Group>
                        ))}
                        <Button variant="light" onClick={addTimeRangeEntry} size="sm">
                            {resources.labels.addTimeRange}
                        </Button>
                    </Stack>
                )}

                {constraintKey === "preferred_weekdays" && (
                    <MultiSelect
                        label={resources.labels.value}
                        placeholder={resources.placeholders.selectWeekday}
                        data={resources.other.weekdays}
                        value={selectedWeekdays}
                        onChange={(value) => {
                            setSelectedWeekdays(value);
                            if (formErrors.value) {
                                setFormErrors({ ...formErrors, value: "" });
                            }
                        }}
                        error={formErrors.value}
                        required
                        mb="md"
                    />
                )}

                <Group justify="flex-end" mt="xl">
                    <Button variant="subtle" onClick={onClose} disabled={loading}>
                        {resources.cancelButton}
                    </Button>
                    <Button type="submit" loading={loading}>
                        {initialData ? resources.updateButton : resources.createButton}
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
