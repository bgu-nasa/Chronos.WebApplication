import { Button, Group } from "@mantine/core";
import resources from "../resources-page.resources.json";

interface ResourceActionsProps {
    selectedResource: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function ResourceActions({
    selectedResource,
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: ResourceActionsProps) {
    return (
        <Group mb="md">
            <Button 
                onClick={onCreateClick}
            >
                {resources.createButton}
            </Button>
            <Button
                onClick={onEditClick}
                disabled={!selectedResource}
                variant="outline"
            >
                {resources.editButton}
            </Button>
            <Button
                onClick={onDeleteClick}
                disabled={!selectedResource}
                variant="outline"
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}
