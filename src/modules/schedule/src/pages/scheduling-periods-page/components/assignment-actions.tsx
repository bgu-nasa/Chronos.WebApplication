/**
 * Assignment Actions Component
 * Action buttons for assignment CRUD operations
 */

import { Button, Group } from "@mantine/core";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import resourcesJson from "../../assignments-page/assignments-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";
interface AssignmentActionsProps {
    selectedAssignment: AssignmentResponse | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function AssignmentActions({
    selectedAssignment,
    onCreateClick,
    onEditClick,
    onDeleteClick,
}: AssignmentActionsProps) {
    useLocaleStore((state) => state.language);
    const resources = translatedResources(
        "src/modules/schedule/src/pages/assignments-page/assignments-page.resources.json",
        resourcesJson
    );
    return (
        <Group mb="md">
            <Button onClick={onCreateClick} size="sm">
                {resources.addAssignmentButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedAssignment}
                onClick={onEditClick}
                size="sm"
            >
                {resources.editButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedAssignment}
                onClick={onDeleteClick}
                size="sm"
            >
                {resources.deleteButton}
            </Button>
        </Group>
    );
}

