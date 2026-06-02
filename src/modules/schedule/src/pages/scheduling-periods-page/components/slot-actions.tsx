import { Button, Group } from "@mantine/core";
import type { SlotResponse } from "@/modules/schedule/src/data";
import resourcesJson from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json",
    resourcesJson,
);
interface SlotActionsProps {
    selectedSlot: SlotResponse | null;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onViewAssignmentsClick?: () => void;
}

export function SlotActions({
    selectedSlot,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    onViewAssignmentsClick,
}: SlotActionsProps) {
    return (
        <Group mb="md">
            <Button onClick={onCreateClick}>
                {resources.createButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedSlot}
                onClick={onEditClick}
            >
                {resources.editButton}
            </Button>
            <Button
                variant="light"
                disabled={!selectedSlot}
                onClick={onDeleteClick}
            >
                {resources.deleteButton}
            </Button>
            {onViewAssignmentsClick && (
                <Button
                    variant="outline"
                    disabled={!selectedSlot}
                    onClick={onViewAssignmentsClick}
                >
                    View Assignments
                </Button>
            )}
        </Group>
    );
}
