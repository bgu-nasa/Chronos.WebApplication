import { Button, Group } from "@mantine/core";
import type { SlotResponse } from "@/modules/schedule/src/data";
import resources from "@/modules/schedule/src/pages/scheduling-periods-page/slot.resources.json";

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
                    {resources.viewAssignmentsButton}
                </Button>
            )}
        </Group>
    );
}
