import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
import { useState } from "react";
import resources from "../resource-attributes-page.resources.json";

interface ResourceAttributeCreatorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string | null }) => Promise<void>;
    loading?: boolean;
}

export function ResourceAttributeCreator({
    opened,
    onClose,
    onSubmit,
    loading = false,
}: ResourceAttributeCreatorProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        $app.logger.info("[ResourceAttributeCreator] handleSubmit called", { title, description });
        if (!title.trim()) {
            $app.logger.warn("[ResourceAttributeCreator] Validation failed - empty title");
            return;
        }
        $app.logger.info("[ResourceAttributeCreator] Calling onSubmit...");
        await onSubmit({ 
            title, 
            description: description.trim() || null 
        });
        $app.logger.info("[ResourceAttributeCreator] onSubmit completed, resetting form");
        setTitle("");
        setDescription("");
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={resources.editorCreateTitle}
            centered
        >
            <Stack>
                <TextInput
                    label={resources.editorTitleLabel}
                    placeholder={resources.editorTitlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    required
                />
                <Textarea
                    label={resources.editorDescriptionLabel}
                    placeholder={resources.editorDescriptionPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    minRows={3}
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!title.trim()}
                    fullWidth
                >
                    {resources.editorCreateButton}
                </Button>
            </Stack>
        </Modal>
    );
}
