import { useEffect, useMemo, useState } from "react";
import {
    Modal, Button, Group, Text,
    Select, MultiSelect, NumberInput
} from "@mantine/core";

import { useActivities, useSubjects } from "@/modules/resources/src/hooks";

import resources from "../constraints-page.resources.json";
import {
    parseRequiredCapacity, parseCommaSeparated, serializeRequiredCapacity,
    serializeCommaSeparated, type RequiredCapacityFormData
} from "../utils";

interface ActivityConstraintEditorProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: {
        activityId: string;
        key: string;
        value: string;
    }) => Promise<void>;
    readonly initialData?: {
        activityId: string;
        key: string;
        value: string;
    };
    readonly loading?: boolean;
}

export function ActivityConstraintEditor({
    opened,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: ActivityConstraintEditorProps) {
    const { activities, fetchActivities } = useActivities();
    const { subjects, fetchSubjects } = useSubjects();

    const constraintTypeOptions = useMemo(() => {
        return resources.constraintTypeOptions.activityConstraints.map(opt => ({
            value: opt.value,
            label: opt.label
        }));
    }, []);

    // Form state for required_capacity: min and max numbers
    const [capacityData, setCapacityData] = useState<RequiredCapacityFormData>({});

    // Form state for location_preference and compatible_resource_types: array of strings
    const [locationValues, setLocationValues] = useState<string[]>([]);
    const [resourceTypeValues, setResourceTypeValues] = useState<string[]>([]);

    // Form state
    const [formValues, setFormValues] = useState({
        activityId: initialData?.activityId || "",
        key: initialData?.key || "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            fetchActivities();
            fetchSubjects();
            if (initialData) {
                setFormValues({
                    activityId: initialData.activityId,
                    key: initialData.key,
                });
                setFormErrors({});

                // Parse the value based on constraint type
                if (initialData.key === "required_capacity") {
                    const parsed = parseRequiredCapacity(initialData.value);
                    setCapacityData(parsed);
                } else if (initialData.key === "location_preference") {
                    const parsed = parseCommaSeparated(initialData.value);
                    setLocationValues(parsed);
                } else if (initialData.key === "compatible_resource_types") {
                    const parsed = parseCommaSeparated(initialData.value);
                    setResourceTypeValues(parsed);
                }
            } else {
                setFormValues({
                    activityId: "",
                    key: "",
                });
                setFormErrors({});
                setCapacityData({});
                setLocationValues([]);
                setResourceTypeValues([]);
            }
        }
    }, [opened, initialData]);

    const handleKeyChange = (value: string | null) => {
        setFormValues({ ...formValues, key: value || "" });
        if (formErrors.key) {
            setFormErrors({ ...formErrors, key: "" });
        }
        // Clear form data when key changes (only when creating new, not editing)
        if (!initialData && value) {
            setCapacityData({});
            setLocationValues([]);
            setResourceTypeValues([]);
        }
    };

    // Validation for form submission
    const validateForm = (): string | null => {
        if (formValues.key === "required_capacity") {
            if (capacityData.min === undefined && capacityData.max === undefined) {
                return resources.validationMessages.minOrMaxRequired;
            }
            if (capacityData.min !== undefined && capacityData.max !== undefined && capacityData.min > capacityData.max) {
                return resources.validationMessages.minGreaterThanMax;
            }
        } else if (formValues.key === "location_preference") {
            if (locationValues.length === 0) {
                return resources.validationMessages.atLeastOneLocation;
            }
        } else if (formValues.key === "compatible_resource_types") {
            if (resourceTypeValues.length === 0) {
                return resources.validationMessages.atLeastOneResourceType;
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        // Validate form fields
        const errors: Record<string, string> = {};
        if (!formValues.activityId) {
            errors.activityId = resources.validationMessages.activityRequired;
        }
        if (!formValues.key) {
            errors.key = resources.validationMessages.keyRequired;
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

            if (formValues.key === "required_capacity") {
                serializedValue = serializeRequiredCapacity(capacityData);
            } else if (formValues.key === "location_preference") {
                serializedValue = serializeCommaSeparated(locationValues);
            } else if (formValues.key === "compatible_resource_types") {
                serializedValue = serializeCommaSeparated(resourceTypeValues);
            }

            await onSubmit({
                ...formValues,
                value: serializedValue,
            });

            // Reset form
            setFormValues({
                activityId: "",
                key: "",
            });
            setFormErrors({});
            setCapacityData({});
            setLocationValues([]);
            setResourceTypeValues([]);
            onClose();
        } catch (error) {
            $app.logger.error("[ActivityConstraintEditor] Error submitting constraint:", error);
            $app.notifications.showError(
                resources.notifications.activityConstraints.failedToSaveConstraint,
                error instanceof Error ? error.message : resources.notifications.activityConstraints.unexpectedError
            );
        }
    };

    // Handle form submission with validation
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit();
    };

    // Group activities by subject for better UX
    const activityOptions = activities.map((activity) => {
        const subject = subjects.find((s) => s.id === activity.subjectId);
        return {
            value: activity.id,
            label: subject
                ? `${subject.name} - ${activity.activityType}`
                : activity.activityType,
        };
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={initialData ? resources.modalTitles.editActivityConstraint : resources.modalTitles.createActivityConstraint}
            size={resources.modalSize}
        >
            <form onSubmit={handleFormSubmit}>
                <Select
                    label={resources.labels.activity}
                    placeholder={resources.placeholders.selectActivity}
                    data={activityOptions}
                    searchable
                    required
                    mb="md"
                    value={formValues.activityId}
                    onChange={(value) => {
                        setFormValues({ ...formValues, activityId: value || "" });
                        if (formErrors.activityId) {
                            setFormErrors({ ...formErrors, activityId: "" });
                        }
                    }}
                    error={formErrors.activityId}
                />

                <Select
                    label={resources.labels.key}
                    placeholder={resources.placeholders.selectConstraintType}
                    data={constraintTypeOptions}
                    required
                    mb="md"
                    value={formValues.key}
                    onChange={handleKeyChange}
                    error={formErrors.key}
                />

                {formValues.key === "required_capacity" && (
                    <>
                        {formErrors.value && (
                            <Text size="sm" c="red" mb="xs">
                                {formErrors.value}
                            </Text>
                        )}
                        <Group grow mb="md">
                            <NumberInput
                                label={resources.labels.minCapacity}
                                placeholder={resources.placeholders.enterMinCapacity}
                                value={capacityData.min}
                                onChange={(value) => {
                                    setCapacityData({ ...capacityData, min: typeof value === "number" ? value : undefined });
                                    if (formErrors.value) {
                                        setFormErrors({ ...formErrors, value: "" });
                                    }
                                }}
                                min={0}
                                allowDecimal={false}
                            />
                            <NumberInput
                                label={resources.labels.maxCapacity}
                                placeholder={resources.placeholders.enterMaxCapacity}
                                value={capacityData.max}
                                onChange={(value) => {
                                    setCapacityData({ ...capacityData, max: typeof value === "number" ? value : undefined });
                                    if (formErrors.value) {
                                        setFormErrors({ ...formErrors, value: "" });
                                    }
                                }}
                                min={0}
                                allowDecimal={false}
                            />
                        </Group>
                    </>
                )}

                {formValues.key === "location_preference" && (
                    <MultiSelect
                        label={resources.labels.locations}
                        placeholder={resources.placeholders.enterLocations}
                        value={locationValues}
                        onChange={(value) => {
                            setLocationValues(value);
                            if (formErrors.value) {
                                setFormErrors({ ...formErrors, value: "" });
                            }
                        }}
                        data={locationValues.map(v => ({ value: v, label: v }))}
                        searchable
                        required
                        error={formErrors.value}
                        mb="md"
                    />
                )}

                {formValues.key === "compatible_resource_types" && (
                    <MultiSelect
                        label={resources.labels.resourceTypes}
                        placeholder={resources.placeholders.enterResourceTypes}
                        value={resourceTypeValues}
                        onChange={(value) => {
                            setResourceTypeValues(value);
                            if (formErrors.value) {
                                setFormErrors({ ...formErrors, value: "" });
                            }
                        }}
                        data={resourceTypeValues.map(v => ({ value: v, label: v }))}
                        searchable
                        required
                        error={formErrors.value}
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
