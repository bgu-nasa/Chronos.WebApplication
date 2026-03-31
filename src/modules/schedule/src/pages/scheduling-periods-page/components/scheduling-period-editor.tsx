/**
 * Scheduling Period Editor Modal Component
 * Handles both create and edit modes for scheduling periods
 */

import { useEffect, useState, useMemo } from "react";
import { Modal, TextInput, Button, Group, Text, Stack } from "@mantine/core";
import { Calendar } from "primereact/calendar";
import { useSchedulingPeriodEditorStore } from "@/modules/schedule/src/stores/scheduling-period-editor.store";
import {
    useCreateSchedulingPeriod,
    useUpdateSchedulingPeriod,
} from "@/modules/schedule/src/hooks/use-scheduling-periods";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json";
import styles from "@/modules/schedule/src/pages/scheduling-periods-page/components/scheduling-period-editor.module.css";

export function SchedulingPeriodEditor() {
    const { isOpen, mode, schedulingPeriod, close } = useSchedulingPeriodEditorStore();
    const { createSchedulingPeriod, isLoading: isCreating, clearError: clearCreateError } = useCreateSchedulingPeriod();
    const { updateSchedulingPeriod, isLoading: isUpdating, clearError: clearUpdateError } = useUpdateSchedulingPeriod();

    const [name, setName] = useState("");
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes or scheduling period changes
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && schedulingPeriod) {
                setName(schedulingPeriod.name);
                setFromDate(schedulingPeriod.fromDate ? new Date(schedulingPeriod.fromDate) : null);
                setToDate(schedulingPeriod.toDate ? new Date(schedulingPeriod.toDate) : null);
            } else {
                setName("");
                setFromDate(null);
                setToDate(null);
            }
            setError(null);
        }
    }, [isOpen, mode, schedulingPeriod]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (name.trim().length === 0) {
            setError(resources.editorNameRequired);
            return;
        }

        if (!fromDate) {
            setError(resources.editorFromDateRequired);
            return;
        }

        if (!toDate) {
            setError(resources.editorToDateRequired);
            return;
        }

        setError(null);
        let success = false;

        // Helper to format date as YYYY-MM-DD to avoid timezone shifts
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const request = {
            name: name.trim(),
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
        };

        if (mode === "create") {
            const result = await createSchedulingPeriod(request);
            success = result !== null;
            if (success) {
                $app.notifications.showSuccess("Success", "Semester created successfully");
            } else {
                $app.notifications.showError("Error", "Failed to create semester");
            }
        } else if (mode === "edit" && schedulingPeriod) {
            success = await updateSchedulingPeriod(schedulingPeriod.id, request);
            if (success) {
                $app.notifications.showSuccess("Success", "Semester updated successfully");
            } else {
                $app.notifications.showError("Error", "Failed to update semester");
            }
        }

        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        close();
        setName("");
        setFromDate(null);
        setToDate(null);
        setError(null);
        // Clear API errors from store
        clearCreateError();
        clearUpdateError();
    };

    const isLoading = isCreating || isUpdating;
    const title =
        mode === "create"
            ? resources.editorCreateTitle
            : resources.editorEditTitle;
    const submitButtonLabel =
        mode === "create"
            ? resources.editorCreateButton
            : resources.editorSaveButton;

    // Date constraints: can select dates from tomorrow onwards (today is disabled)
    const { today, minFromDate } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        return { today: now, minFromDate: tomorrow };
    }, []);

    // The minimum date for "To Date" is at least 1 day after "From Date"
    const minToDate = useMemo(() => {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (!fromDate) return tomorrow;

        // To Date must be at least 1 day after From Date
        const dayAfterFromDate = new Date(fromDate);
        dayAfterFromDate.setDate(dayAfterFromDate.getDate() + 1);

        return dayAfterFromDate > tomorrow ? dayAfterFromDate : tomorrow;
    }, [fromDate, today]);

    // Handle From Date change - clear To Date if it's now invalid
    const handleFromDateChange = (value: Date | null) => {
        setFromDate(value);

        // If the new from date makes to date invalid (to date must be > from date)
        if (value && toDate) {
            const dayAfterFromDate = new Date(value);
            dayAfterFromDate.setDate(dayAfterFromDate.getDate() + 1);
            if (toDate < dayAfterFromDate) {
                setToDate(null);
            }
        }
    };

    return (
        <Modal opened={isOpen} onClose={handleClose} title={title} centered size="md">
            <form onSubmit={handleSubmit}>
                <TextInput
                    label={resources.editorNameLabel}
                    placeholder={resources.editorNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    error={error && error === resources.editorNameRequired ? error : null}
                    required
                    disabled={isLoading}
                    data-autofocus
                    mb="md"
                />

                <Stack gap="xs" mb="md">
                    <Text size="sm" fw={500}>
                        {resources.editorFromDateLabel} <span style={{ color: "var(--mantine-color-error)" }}>*</span>
                    </Text>
                    <Calendar
                        value={fromDate}
                        onChange={(e) => handleFromDateChange(e.value as Date | null)}
                        minDate={minFromDate}
                        dateFormat="M dd, yy"
                        placeholder={resources.editorFromDatePlaceholder}
                        showIcon
                        disabled={isLoading}
                        className={styles.calendarInput}
                        panelClassName={styles.calendarPanel}
                        touchUI
                    />
                    {error && error === resources.editorFromDateRequired && (
                        <Text size="xs" c="var(--mantine-color-error)">{error}</Text>
                    )}
                </Stack>

                <Stack gap="xs" mb="md">
                    <Text size="sm" fw={500}>
                        {resources.editorToDateLabel} <span style={{ color: "var(--mantine-color-error)" }}>*</span>
                    </Text>
                    <Calendar
                        value={toDate}
                        onChange={(e) => setToDate(e.value as Date | null)}
                        minDate={minToDate}
                        viewDate={minToDate}
                        dateFormat="M dd, yy"
                        placeholder={resources.editorToDatePlaceholder}
                        showIcon
                        disabled={isLoading}
                        className={styles.calendarInput}
                        panelClassName={styles.calendarPanel}
                        touchUI
                    />
                    {error && error === resources.editorToDateRequired && (
                        <Text size="xs" c="var(--mantine-color-error)">{error}</Text>
                    )}
                </Stack>

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="subtle"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {resources.editorCancelButton}
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        {submitButtonLabel}
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
