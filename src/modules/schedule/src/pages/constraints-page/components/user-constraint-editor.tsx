import { useEffect, useMemo, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";

import {
    Modal, TextInput, Button, Text,
    Group, Select, MultiSelect,
    ActionIcon, Stack
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";

import { useUsers } from "@/modules/auth/src/hooks";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks";

import resources from "../constraints-page.resources.json";
import {
    parseForbiddenTimeRange, parsePreferredWeekdays, serializeForbiddenTimeRange,
    serializePreferredWeekdays, type ForbiddenTimeRangeEntry
} from "../utils";

interface UserConstraintEditorProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: {
        userId: string;
        schedulingPeriodId: string;
        key: string;
        value: string;
        isPreference: boolean;
    }) => Promise<void>;
    readonly initialData?: {
        userId: string;
        schedulingPeriodId: string;
        key: string;
        value: string;
        isPreference: boolean;
    };
    readonly isAdmin: boolean;
    readonly currentUserId?: string;
    readonly loading?: boolean;
    readonly isPreference: boolean;
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

    // Determine the constraint key based on isPreference
    const constraintKey = useMemo(() => {
        if (initialData?.key) {
            return initialData.key;
        }
        return isPreference ? "preferred_weekdays" : "forbidden_timerange";
    }, [initialData?.key, isPreference]);

    // Get the constraint type label
    const constraintTypeLabel = useMemo(() => {
        const options = isPreference
            ? resources.constraintTypeOptions.userPreferences
            : resources.constraintTypeOptions.userConstraints;
        return options.find(opt => opt.value === constraintKey)?.label || constraintKey;
    }, [constraintKey, isPreference]);

    // Form state for forbidden_timerange: array of time range entries with unique IDs
    const [timeRangeEntries, setTimeRangeEntries] = useState<Array<ForbiddenTimeRangeEntry & { id: string }>>([]);

    // Form state for preferred_weekdays: array of selected weekdays
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);

    // Form state
    const [formValues, setFormValues] = useState({
        userId: initialData?.userId || currentUserId || "",
        schedulingPeriodId: initialData?.schedulingPeriodId || "",
        key: constraintKey,
        isPreference: initialData?.isPreference ?? isPreference,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            fetchUsers();
            fetchSchedulingPeriods();
        }
    }, [opened]);

    // Generate unique ID for time range entries
    const generateEntryId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // Initialize form data when editing
    const initializeEditData = () => {
        if (!initialData) return;

        setFormValues({
            userId: initialData.userId,
            schedulingPeriodId: initialData.schedulingPeriodId,
            key: initialData.key,
            isPreference: initialData.isPreference,
        });
        setFormErrors({});

        // Parse the value based on constraint type
        if (initialData.key === "forbidden_timerange") {
            const entries = parseForbiddenTimeRange(initialData.value);
            const entriesWithIds = entries.length > 0
                ? entries.map(e => ({ ...e, id: generateEntryId() }))
                : [{ weekday: "", startTime: "", endTime: "", id: generateEntryId() }];
            setTimeRangeEntries(entriesWithIds);
        } else if (initialData.key === "preferred_weekdays") {
            const weekdays = parsePreferredWeekdays(initialData.value);
            setSelectedWeekdays(weekdays);
        }
    };

    // Initialize form data when creating new
    const initializeNewData = () => {
        setFormValues({
            userId: !isAdmin && currentUserId ? currentUserId : "",
            schedulingPeriodId: "",
            key: constraintKey,
            isPreference: isPreference,
        });
        setFormErrors({});

        // Initialize empty form data based on constraint type
        if (constraintKey === "forbidden_timerange") {
            setTimeRangeEntries([{ weekday: "", startTime: "", endTime: "", id: generateEntryId() }]);
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

    const handleSubmit = async () => {
        // Validate form fields
        const errors: Record<string, string> = {};
        if (!formValues.userId) {
            errors.userId = resources.validationMessages.userRequired;
        }
        if (!formValues.schedulingPeriodId) {
            errors.schedulingPeriodId = resources.validationMessages.schedulingPeriodRequired;
        }

        // Validate constraint-specific fields
        const validationError = validateForm();
        if (validationError) {
            errors.value = validationError;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Serialize form data based on constraint type
            let serializedValue = "";

            if (constraintKey === "forbidden_timerange") {
                // Remove id field before serializing
                const entriesWithoutIds = timeRangeEntries.map(({ id, ...entry }) => entry);
                serializedValue = serializeForbiddenTimeRange(entriesWithoutIds);
            } else if (constraintKey === "preferred_weekdays") {
                serializedValue = serializePreferredWeekdays(selectedWeekdays);
            }

            await onSubmit({
                ...formValues,
                value: serializedValue,
                isPreference: initialData?.isPreference ?? isPreference,
            });

            // Reset form
            setFormValues({
                userId: !isAdmin && currentUserId ? currentUserId : "",
                schedulingPeriodId: "",
                key: constraintKey,
                isPreference: isPreference,
            });
            setFormErrors({});
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
        setTimeRangeEntries([...timeRangeEntries, { weekday: "", startTime: "", endTime: "", id: generateEntryId() }]);
    };

    const removeTimeRangeEntry = (id: string) => {
        setTimeRangeEntries(timeRangeEntries.filter(entry => entry.id !== id));
    };

    const updateTimeRangeEntry = (id: string, field: keyof ForbiddenTimeRangeEntry, value: string) => {
        setTimeRangeEntries(timeRangeEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    // Validation for form submission
    const validateForm = (): string | null => {
        if (constraintKey === "forbidden_timerange") {
            const validEntries = timeRangeEntries.filter(e => e.weekday && e.startTime && e.endTime);
            if (validEntries.length === 0) {
                return resources.validationMessages.atLeastOneTimeRange;
            }

            // Validate each entry
            for (const entry of validEntries) {
                const [startHours, startMinutes] = entry.startTime.split(':').map(Number);
                const [endHours, endMinutes] = entry.endTime.split(':').map(Number);
                const startTotal = startHours * 60 + startMinutes;
                const endTotal = endHours * 60 + endMinutes;

                if (startTotal >= endTotal) {
                    return resources.validationMessages.startTimeBeforeEndTime;
                }
            }
        } else if (constraintKey === "preferred_weekdays") {
            if (selectedWeekdays.length === 0) {
                return resources.validationMessages.atLeastOneWeekday;
            }
        }
        return null;
    };

    // Handle form submission with validation
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

    let modalTitle: string;
    if (initialData) {
        modalTitle = isPreference
            ? resources.modalTitles.editUserPreference
            : resources.modalTitles.editUserConstraint;
    } else {
        modalTitle = isPreference
            ? resources.modalTitles.createUserPreference
            : resources.modalTitles.createUserConstraint;
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={modalTitle}
            size={resources.modalSize}
        >
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
                        value={
                            (() => {
                                const user = users.find((u) => u.id === currentUserId);
                                return user ? `${user.firstName} ${user.lastName}` : resources.other.currentUser;
                            })()
                        }
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

                <TextInput
                    label={resources.labels.key}
                    value={constraintTypeLabel}
                    disabled
                    mb="md"
                />

                {constraintKey === "forbidden_timerange" && (
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
                        <Button
                            variant="light"
                            onClick={addTimeRangeEntry}
                            size="sm"
                        >
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
                    <Button
                        type="submit"
                        loading={loading}
                    >
                        {initialData ? resources.updateButton : resources.createButton}
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
