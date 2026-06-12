import { useEffect, useState } from "react";
import { Modal, TextInput, Textarea, Button, Group, Stack } from "@mantine/core";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
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
    assignmentId: string | null;
    onCreated: () => void;
}

export function CreateAppealModal({
    opened,
    onClose,
    assignmentId,
    onCreated,
}: CreateAppealModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (opened) {
            setTitle("");
            setDescription("");
            setErrors({});
        }
    }, [opened]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = resources.createAppealModal.titleRequired;
        if (!description.trim()) newErrors.description = resources.createAppealModal.descriptionRequired;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !assignmentId) return;

        setIsSubmitting(true);
        try {
            await appealDataRepository.createAppeal({
                assignmentId,
                title: title.trim(),
                description: description.trim(),
            });
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
