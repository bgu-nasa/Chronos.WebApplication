import { useEffect, useState } from "react";
import { Modal, TextInput, Button, Group, Select, Textarea } from "@mantine/core";

import { useSchedulingPeriods } from "@/modules/schedule/src/hooks";

import resources from "../constraints-page.resources.json";

interface OrganizationPolicyEditorProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: {
        schedulingPeriodId: string;
        key: string;
        value: string;
    }) => Promise<void>;
    readonly initialData?: {
        schedulingPeriodId: string;
        key: string;
        value: string;
    };
    readonly loading?: boolean;
}

export function OrganizationPolicyEditor({
    opened,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: OrganizationPolicyEditorProps) {
    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();

    // Form state
    const [formValues, setFormValues] = useState({
        schedulingPeriodId: initialData?.schedulingPeriodId || "",
        key: initialData?.key || "",
        value: initialData?.value || "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            fetchSchedulingPeriods();
            if (initialData) {
                setFormValues(initialData);
            } else {
                setFormValues({
                    schedulingPeriodId: "",
                    key: "",
                    value: "",
                });
            }
            setFormErrors({});
        }
    }, [opened, initialData]);

    const handleSubmit = async () => {
        // Validate form fields
        const errors: Record<string, string> = {};
        if (!formValues.schedulingPeriodId) {
            errors.schedulingPeriodId = resources.validationMessages.schedulingPeriodRequired;
        }
        if (!formValues.key) {
            errors.key = resources.validationMessages.keyRequired;
        }
        if (!formValues.value) {
            errors.value = resources.validationMessages.valueRequired;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await onSubmit(formValues);

            // Reset form
            setFormValues({
                schedulingPeriodId: "",
                key: "",
                value: "",
            });
            setFormErrors({});
            onClose();
        } catch (error) {
            $app.logger.error("[OrganizationPolicyEditor] Error submitting policy:", error);
            $app.notifications.showError(
                resources.notifications.organizationPolicies.failedToSavePolicy,
                error instanceof Error ? error.message : resources.notifications.organizationPolicies.unexpectedError
            );
        }
    };

    const periodOptions = schedulingPeriods.map((period) => ({
        value: period.id,
        label: period.name,
    }));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={initialData ? resources.modalTitles.editOrganizationPolicy : resources.modalTitles.createOrganizationPolicy}
            size={resources.modalSize}
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                    placeholder={resources.placeholders.keyExamples.organization}
                    required
                    mb="md"
                    value={formValues.key}
                    onChange={(e) => {
                        setFormValues({ ...formValues, key: e.currentTarget.value });
                        if (formErrors.key) {
                            setFormErrors({ ...formErrors, key: "" });
                        }
                    }}
                    error={formErrors.key}
                />

                <Textarea
                    label={resources.labels.value}
                    placeholder={resources.placeholders.valueExamples.organization}
                    required
                    mb="md"
                    minRows={resources.other.textareaMinRows}
                    value={formValues.value}
                    onChange={(e) => {
                        setFormValues({ ...formValues, value: e.currentTarget.value });
                        if (formErrors.value) {
                            setFormErrors({ ...formErrors, value: "" });
                        }
                    }}
                    error={formErrors.value}
                />

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
