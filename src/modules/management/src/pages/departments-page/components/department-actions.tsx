import { Button } from "@mantine/core";
import resourcesJson from "@/modules/management/src/pages/departments-page/departments-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/departments-page/departments-page.resources.json",
    resourcesJson,
);
interface DepartmentActionsProps {
    selectedDepartment: any | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function DepartmentActions({
    selectedDepartment, // will be used in the future
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: DepartmentActionsProps) {
    return (
        <Button.Group mb="md">
            <Button onClick={onCreateClick}>{resources.createButton}</Button>
            <Button onClick={onEditClick} disabled={!selectedDepartment}>
                {resources.editButton}
            </Button>
            <Button onClick={onDeleteClick} disabled={!selectedDepartment}>
                {resources.deleteButton}
            </Button>
        </Button.Group>
    );
}
