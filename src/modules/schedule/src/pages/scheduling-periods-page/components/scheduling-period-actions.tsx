import { Button, Group } from "@mantine/core";
import resourcesJson from "@/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";

const resources = translatedResources(
    "src/modules/schedule/src/pages/scheduling-periods-page/scheduling-periods-page.resources.json",
    resourcesJson,
);
interface SchedulingPeriodActionsProps {
    selectedPeriod: any | null;
    isExpired: boolean;
    onCreateClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onViewSlotsClick: () => void;
    onRunBatchAssignmentClick: () => void;
    isBatchAssignmentLoading?: boolean;
}

export function SchedulingPeriodActions({
    selectedPeriod,
    isExpired,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    onViewSlotsClick,
    onRunBatchAssignmentClick,
    isBatchAssignmentLoading = false,
}: SchedulingPeriodActionsProps) {
    useLocaleStore((state) => state.language);

    return (
        <Group mb="md">
            <Button onClick={onCreateClick}>
                {resources.createButton}
            </Button>
            <Button
                variant="light"
                onClick={onEditClick}
                disabled={!selectedPeriod || isExpired}
            >
                {resources.editButton}
            </Button>
            <Button
                variant="light"
                onClick={onDeleteClick}
                disabled={!selectedPeriod || isExpired}
            >
                {resources.deleteButton}
            </Button>
            <Button
                variant="light"
                onClick={onViewSlotsClick}
                disabled={!selectedPeriod}
            >
                {resources.viewSlotsButton}
            </Button>
            <Button
                variant="filled"
                color="green"
                onClick={onRunBatchAssignmentClick}
                disabled={!selectedPeriod || isExpired || isBatchAssignmentLoading}
                loading={isBatchAssignmentLoading}
            >
                {resources.runBatchAssignmentButton}
            </Button>
        </Group>
    );
}
