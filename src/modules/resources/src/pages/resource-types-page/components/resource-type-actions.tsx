import { Button, Group } from "@mantine/core";
import resourcesJson from "../resource-types-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/resource-types-page/resource-types-page.resources.json",
    resourcesJson,
);
interface ResourceTypeActionsProps {
    selectedResourceType: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function ResourceTypeActions({
    selectedResourceType,
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: ResourceTypeActionsProps) {
    return (
        <Group mb="md">
            <Button
                onClick={onCreateClick}
            >
                {resources.createButton}
            </Button>
            <Button
                onClick={onEditClick}
                disabled={!selectedResourceType}
                variant="outline"
            >
                {resources.editButton}
            </Button>
            <Button
                onClick={onDeleteClick}
                disabled={!selectedResourceType}
                variant="outline"
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}
