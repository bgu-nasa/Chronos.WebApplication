import { Button, Group } from "@mantine/core";
import resourcesJson from "../resources-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resources-page/resources-page.resources.json",
    resourcesJson,
);
interface ResourceActionsProps {
    selectedResource: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onAssignAttributesClick: () => void;
}

export function ResourceActions({
    selectedResource,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    onAssignAttributesClick,
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
            <Button
                onClick={onAssignAttributesClick}
                disabled={!selectedResource}
                variant="outline"
            >
                {resources.assignAttributesButton}
            </Button>
        </Group>
    );
}
