/**
 * Department Editor Modal Component
 * Handles both create and edit modes for departments
 */

import { useEffect, useState } from "react";
import { Modal, TextInput, Button, Group } from "@mantine/core";
import { useDepartmentEditorStore } from "@/modules/management/src/stores/department-editor.store";
import {
    useCreateDepartment,
    useUpdateDepartment,
} from "@/modules/management/src/hooks/use-departments";
import resourcesJson from "@/modules/management/src/pages/departments-page/departments-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/departments-page/departments-page.resources.json",
    resourcesJson,
);
export function DepartmentEditor() {
    const { isOpen, mode, department, close } = useDepartmentEditorStore();
    const { createDepartment, isLoading: isCreating } = useCreateDepartment();
    const { updateDepartment, isLoading: isUpdating } = useUpdateDepartment();

    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes or department changes
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && department) {
                setName(department.name);
            } else {
                setName("");
            }
            setError(null);
        }
    }, [isOpen, mode, department]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (name.trim().length === 0) {
            setError(resources.editorNameRequired);
            return;
        }

        setError(null);
        let success = false;

        if (mode === "create") {
            const result = await createDepartment({ name: name.trim() });
            success = result !== null;
        } else if (mode === "edit" && department) {
            success = await updateDepartment(department.id, {
                name: name.trim(),
            });
        }

        if (success) {
            handleClose();
            // State automatically updated by store, no need for onSuccess callback
        }
    };

    const handleClose = () => {
        close();
        setName("");
        setError(null);
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

    return (
        <Modal opened={isOpen} onClose={handleClose} title={title} centered>
            <form onSubmit={handleSubmit}>
                <TextInput
                    label={resources.editorNameLabel}
                    placeholder={resources.editorNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    error={error}
                    required
                    disabled={isLoading}
                    data-autofocus
                />

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
