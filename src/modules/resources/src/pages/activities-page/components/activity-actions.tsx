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
    // Check if user has ResourceManager or Administrator role for create/edit/delete operations
    const canManage = $app.organization.isResourceManager() || $app.organization.isAdministrator();
    
    return (
        <Group mb="md">
            <Button 
                onClick={onCreateClick}
                disabled={!canManage}
            >
                {resources.createButton}
            </Button>
            <Button 
                onClick={onEditClick} 
                disabled={!selectedActivity || !canManage}
            >
                {resources.editButton}
            </Button>
            <Button 
                onClick={onDeleteClick} 
                disabled={!selectedActivity || !canManage}
                variant={selectedActivity ? "filled" : "default"}
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}
