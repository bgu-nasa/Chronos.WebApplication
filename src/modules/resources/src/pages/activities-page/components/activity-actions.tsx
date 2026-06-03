import { Button, Group } from "@mantine/core";
import resourcesJson from "../activities-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/activities-page/activities-page.resources.json",
    resourcesJson,
);
interface ActivityActionsProps {
    selectedActivity: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function ActivityActions({
    selectedActivity,
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: ActivityActionsProps) {
    return (
        <Group mb="md">
            <Button
                onClick={onCreateClick}
            >
                {resources.createButton}
            </Button>
            <Button
                onClick={onEditClick}
                disabled={!selectedActivity}
            >
                {resources.editButton}
            </Button>
            <Button
                onClick={onDeleteClick}
                disabled={!selectedActivity}
                variant={selectedActivity ? "filled" : "default"}
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}
