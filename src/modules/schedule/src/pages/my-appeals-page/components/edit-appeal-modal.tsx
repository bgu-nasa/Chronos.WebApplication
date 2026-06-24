import { useEffect, useState } from "react";
import { Modal, TextInput, Textarea, Button, Group, Stack } from "@mantine/core";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import { $app } from "@/infra/service";
import resourcesJson from "../my-appeals-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/schedule/src/pages/my-appeals-page/my-appeals-page.resources.json",
    resourcesJson,
);

interface EditAppealModalProps {
    appeals: AppealResponse[];
    onClose: () => void;
    onUpdated: () => void;
}

export function EditAppealModal({ appeals, onClose, onUpdated }: EditAppealModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (appeals.length > 0) {
            setTitle(appeals[0].title);
            setDescription(appeals[0].description);
            setErrors({});
        }
    }, [appeals]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = resources.titleRequired;
        if (!description.trim()) newErrors.description = resources.descriptionRequired;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || appeals.length === 0) return;

        setIsSubmitting(true);
        try {
            for (const appeal of appeals) {
                await appealDataRepository.updateAppeal(appeal.id, {
                    title: title.trim(),
                    description: description.trim(),
                });
            }
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.editSuccess,
            );
            onUpdated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to update appeal:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.editError,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            opened={appeals.length > 0}
            onClose={onClose}
            title={resources.editModalTitle}
            centered
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label={resources.titleColumn}
                        placeholder={resources.titlePlaceholder}
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
                        placeholder={resources.descriptionPlaceholder}
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
                            {resources.cancelButton}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {resources.saveButton}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

