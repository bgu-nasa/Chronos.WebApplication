import { Modal, TextInput, Button, Stack, NumberInput, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { useResourceTypes } from "@/modules/resources/src/hooks";
import resourcesJson from "../resources-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resources-page/resources-page.resources.json",
    resourcesJson,
);
interface ResourceCreatorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: {
        resourceTypeId: string;
        location: string;
        identifier: string;
        capacity: number | null;
    }) => Promise<void>;
    loading?: boolean;
}

export function ResourceCreator({
    opened,
    onClose,
    onSubmit,
    loading = false,
}: ResourceCreatorProps) {
    const [resourceTypeId, setResourceTypeId] = useState("");
    const [location, setLocation] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [capacity, setCapacity] = useState<number | null>(null);

    const { resourceTypes, fetchResourceTypes } = useResourceTypes();

    useEffect(() => {
        if (opened) {
            fetchResourceTypes();
        }
    }, [opened, fetchResourceTypes]);

    const handleSubmit = async () => {
        $app.logger.info("[ResourceCreator] handleSubmit called", {
            resourceTypeId,
            location,
            identifier,
            capacity,
        });

        if (!resourceTypeId.trim() || !location.trim() || !identifier.trim()) {
            $app.logger.warn("[ResourceCreator] Validation failed - empty required fields");
            return;
        }

        $app.logger.info("[ResourceCreator] Calling onSubmit...");
        await onSubmit({
            resourceTypeId,
            location,
            identifier,
            capacity,
        });

        $app.logger.info("[ResourceCreator] onSubmit completed, resetting form");
        setResourceTypeId("");
        setLocation("");
        setIdentifier("");
        setCapacity(null);
    };

    const handleClose = () => {
        setResourceTypeId("");
        setLocation("");
        setIdentifier("");
        setCapacity(null);
        onClose();
    };

    const resourceTypeOptions = resourceTypes.map((rt) => ({
        value: rt.id,
        label: rt.type,
    }));

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={resources.editorCreateTitle}
            centered
        >
            <Stack>
                <Select
                    label={resources.editorResourceTypeLabel}
                    placeholder={resources.editorResourceTypePlaceholder}
                    value={resourceTypeId}
                    onChange={(value) => setResourceTypeId(value || "")}
                    data={resourceTypeOptions}
                    required
                />
                <TextInput
                    label={resources.editorIdentifierLabel}
                    placeholder={resources.editorIdentifierPlaceholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.currentTarget.value)}
                    required
                />
                <TextInput
                    label={resources.editorLocationLabel}
                    placeholder={resources.editorLocationPlaceholder}
                    value={location}
                    onChange={(e) => setLocation(e.currentTarget.value)}
                    required
                />
                <NumberInput
                    label={resources.editorCapacityLabel}
                    placeholder={resources.editorCapacityPlaceholder}
                    value={capacity ?? undefined}
                    onChange={(value) => setCapacity(value === "" ? null : Number(value))}
                    min={0}
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!resourceTypeId.trim() || !location.trim() || !identifier.trim()}
                    fullWidth
                >
                    {resources.editorCreateButton}
                </Button>
            </Stack>
        </Modal>
    );
}
