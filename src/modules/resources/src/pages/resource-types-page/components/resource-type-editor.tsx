import { Modal, TextInput, Button, Stack } from "@mantine/core";
import { useState, useEffect } from "react";
import resourcesJson from "../resource-types-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resource-types-page/resource-types-page.resources.json",
    resourcesJson,
);
interface ResourceTypeEditorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { type: string }) => Promise<void>;
    loading?: boolean;
    initialData?: { type: string };
}

export function ResourceTypeEditor({
    opened,
    onClose,
    onSubmit,
    loading = false,
    initialData,
}: ResourceTypeEditorProps) {
    const [type, setType] = useState("");

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
        }
    }, [initialData]);

    const handleSubmit = async () => {
        $app.logger.info("[ResourceTypeEditor] handleSubmit called", { type });
        if (!type.trim()) {
            $app.logger.warn("[ResourceTypeEditor] Validation failed - empty fields");
            return;
        }
        $app.logger.info("[ResourceTypeEditor] Calling onSubmit...");
        await onSubmit({ type });
        $app.logger.info("[ResourceTypeEditor] onSubmit completed, resetting form");
        setType("");
    };

    const handleClose = () => {
        setType("");
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
                    label={resources.editorTypeLabel}
                    placeholder={resources.editorTypePlaceholder}
                    value={type}
                    onChange={(e) => setType(e.currentTarget.value)}
                    required
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!type.trim()}
                    fullWidth
                >
                    {resources.editorSaveButton}
                </Button>
            </Stack>
        </Modal>
    );
}
