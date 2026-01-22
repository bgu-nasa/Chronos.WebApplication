import { Modal, TextInput, Textarea, Button, Stack } from "@mantine/core";
import { useState, useEffect } from "react";
import resources from "../resource-attributes-page.resources.json";

interface ResourceAttributeEditorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string | null }) => Promise<void>;
    loading?: boolean;
    initialData?: { title: string; description: string | null };
}

export function ResourceAttributeEditor({
    opened,
    onClose,
    onSubmit,
    loading = false,
    initialData,
}: ResourceAttributeEditorProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || "");
        }
    }, [initialData]);

    const handleSubmit = async () => {
        $app.logger.info("[ResourceAttributeEditor] handleSubmit called", { title, description });
        if (!title.trim()) {
            $app.logger.warn("[ResourceAttributeEditor] Validation failed - empty title");
            return;
        }
        $app.logger.info("[ResourceAttributeEditor] Calling onSubmit...");
        await onSubmit({ 
            title, 
            description: description.trim() || null 
        });
        $app.logger.info("[ResourceAttributeEditor] onSubmit completed, resetting form");
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
            title={resources.editorEditTitle}
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
                    {resources.editorSaveButton}
                </Button>
            </Stack>
        </Modal>
    );
}
