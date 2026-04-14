import { Modal, Text, Stack, Group, Badge, Divider } from "@mantine/core";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { SlotResponse } from "@/modules/schedule/src/data/slot.types";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";
import type { ResourceResponse } from "@/modules/schedule/src/data/resource.types";
import resources from "../appeals-page.resources.json";

interface AppealDetails {
    assignment?: AssignmentResponse;
    slot?: SlotResponse;
    activity?: EnrichedActivity;
    resource?: ResourceResponse;
}

interface ViewAppealModalProps {
    appeal: AppealResponse | null;
    details?: AppealDetails;
    onClose: () => void;
}

const formatTime = (time: string) => {
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
};

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={600} c="dimmed">
                {label}
            </Text>
            <Text size="sm" ta="right" style={{ maxWidth: "65%" }}>
                {value}
            </Text>
        </Group>
    );
}

export function ViewAppealModal({ appeal, details, onClose }: ViewAppealModalProps) {
    if (!appeal) return null;

    const day = details?.slot?.weekday || "—";
    const time = details?.slot
        ? `${formatTime(details.slot.fromTime)} - ${formatTime(details.slot.toTime)}`
        : "—";
    const activity = details?.activity?.displayLabel || "—";
    const resource = details?.resource
        ? `${details.resource.location} / ${details.resource.identifier}`
        : "—";

    return (
        <Modal
            opened={!!appeal}
            onClose={onClose}
            title={resources.viewModalTitle}
            centered
            size="md"
        >
            <Stack gap="md">
                <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                        {resources.titleColumn}
                    </Text>
                    <Text size="lg" fw={600}>
                        {appeal.title}
                    </Text>
                </div>

                <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                        {resources.descriptionColumn}
                    </Text>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {appeal.description}
                    </Text>
                </div>

                <Divider />

                <div>
                    <Group gap="xs" mb="sm">
                        <Badge variant="light" size="sm">
                            {resources.assignmentDetailsLabel}
                        </Badge>
                    </Group>
                    <Stack gap="xs">
                        <DetailRow label={resources.dayColumn} value={day} />
                        <DetailRow label={resources.timeColumn} value={time} />
                        <DetailRow label={resources.activityColumn} value={activity} />
                        <DetailRow label={resources.resourceColumn} value={resource} />
                    </Stack>
                </div>
            </Stack>
        </Modal>
    );
}
