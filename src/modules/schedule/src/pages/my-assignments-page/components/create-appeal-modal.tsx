import { useEffect, useState } from "react";
import { Modal, TextInput, Textarea, Button, Group, Stack } from "@mantine/core";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";

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
        if (!title.trim()) newErrors.title = "Title is required";
        if (!description.trim()) newErrors.description = "Description is required";
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
            $app.notifications.showSuccess("Success", "Appeal created successfully");
            onCreated();
            onClose();
        } catch (error) {
            $app.logger.error("Failed to create appeal:", error);
            $app.notifications.showError("Error", "Failed to create appeal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Appeal" centered size="md">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Title"
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
                        label="Description"
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
                            Submit Appeal
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
