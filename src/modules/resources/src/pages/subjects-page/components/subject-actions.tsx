import { Button, Group } from "@mantine/core";
import resourcesJson from "../subjects-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/resources/src/pages/subjects-page/subjects-page.resources.json",
    resourcesJson,
);
interface SubjectActionsProps {
    selectedSubject: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onViewActivitiesClick: () => void;
    hasDepartmentContext: boolean;
}

export function SubjectActions({
    selectedSubject,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    onViewActivitiesClick,
    hasDepartmentContext,
}: SubjectActionsProps) {
    return (
        <Group mb="md">
            <Button onClick={onCreateClick} disabled={!hasDepartmentContext}>
                {resources.createButton}
            </Button>
            <Button 
                onClick={onEditClick} 
                disabled={!selectedSubject}
                variant="outline"
            >
                {resources.editButton}
            </Button>
            <Button 
                onClick={onDeleteClick} 
                disabled={!selectedSubject}
                variant="outline"
            >
                {resources.deleteButton}
            </Button>
            <Button 
                onClick={onViewActivitiesClick} 
                disabled={!selectedSubject}
                variant="light"
            >
                {resources.viewActivitiesButton}
            </Button>
        </Group>
    );
}
