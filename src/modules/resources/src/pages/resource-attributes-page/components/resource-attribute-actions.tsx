import { Button, Group } from "@mantine/core";
import resources from "../resource-attributes-page.resources.json";

interface ResourceAttributeActionsProps {
    selectedResourceAttribute: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function ResourceAttributeActions({
    selectedResourceAttribute,
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: ResourceAttributeActionsProps) {
    return (
        <Group mb="md">
            <Button onClick={onCreateClick}>
                {resources.createButton}
            </Button>
            <Button
                onClick={onEditClick}
                disabled={!selectedResourceAttribute}
                variant="outline"
            >
                {resources.editButton}
            </Button>
            <Button
                onClick={onDeleteClick}
                disabled={!selectedResourceAttribute}
                variant="outline"
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}
