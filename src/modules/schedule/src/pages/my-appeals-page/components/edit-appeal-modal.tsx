import { useEffect, useState } from "react";
import { Modal, TextInput, Textarea, Button, Group, Stack } from "@mantine/core";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import resources from "../my-appeals-page.resources.json";

interface EditAppealModalProps {
    appeal: AppealResponse | null;
    onClose: () => void;
    onUpdated: () => void;
}

export function EditAppealModal({ appeal, onClose, onUpdated }: EditAppealModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (appeal) {
            setTitle(appeal.title);
            setDescription(appeal.description);
            setErrors({});
        }
    }, [appeal]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (!description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !appeal) return;

        setIsSubmitting(true);
        try {
            await appealDataRepository.updateAppeal(appeal.id, {
                title: title.trim(),
                description: description.trim(),
            });
            $app.notifications.showSuccess("Success", resources.editSuccess);
            onUpdated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to update appeal:", error);
            $app.notifications.showError("Error", resources.editError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            opened={!!appeal}
            onClose={onClose}
            title={resources.editModalTitle}
            centered
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label={resources.titleColumn}
                        placeholder="Enter appeal title"
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
                        label={resources.descriptionColumn}
                        placeholder="Describe your appeal reason"
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
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Save
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
