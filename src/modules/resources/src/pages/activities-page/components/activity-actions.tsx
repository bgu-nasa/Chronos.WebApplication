import { Button, Group } from "@mantine/core";
import resources from "../activities-page.resources.json";

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
