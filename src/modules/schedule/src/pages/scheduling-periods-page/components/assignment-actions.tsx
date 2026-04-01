/**
 * Assignment Actions Component
 * Action buttons for assignment CRUD operations
 */

import { Button, Group } from "@mantine/core";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/assignment.resources.json";

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
    return (
        <Group mb="md">
            <Button onClick={onCreateClick} size="sm">
                {resources.actions.addButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedAssignment}
                onClick={onEditClick}
                size="sm"
            >
                {resources.actions.editButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedAssignment}
                onClick={onDeleteClick}
                size="sm"
            >
                {resources.actions.deleteButton}
            </Button>
        </Group>
    );
}

