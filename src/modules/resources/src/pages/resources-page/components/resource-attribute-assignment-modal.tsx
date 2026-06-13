import { useEffect, useState } from "react";
import { Modal, Button, Select, Stack, Group, Text, Badge, Divider, Loader } from "@mantine/core";
import {
    useResourceAttributes,
    useResourceAttributeAssignments,
    useCreateResourceAttributeAssignment,
    useDeleteResourceAttributeAssignment,
} from "@/modules/resources/src/hooks";
import type { CreateResourceAttributeAssignmentRequest } from "@/modules/resources/src/data";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);
import resourcesJson from "../resources-page.resources.json";

const resources = translatedResources(
    "src/modules/resources/src/pages/resources-page/resources-page.resources.json",
    resourcesJson,
);


interface ResourceAttributeAssignmentModalProps {
    opened: boolean;
    onClose: () => void;
    resourceId: string | null;
    resourceIdentifier?: string;
}

export function ResourceAttributeAssignmentModal({
    opened,
    onClose,
    resourceId,
    resourceIdentifier,
}: ResourceAttributeAssignmentModalProps) {
    const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);

    const { resourceAttributes, fetchResourceAttributes, isLoading: attributesLoading } = useResourceAttributes();
    const {
        resourceAttributeAssignments,
        fetchAssignmentsByResourceId,
        clearAssignments,
        isLoading: assignmentsLoading,
    } = useResourceAttributeAssignments();
    const { createAssignment, isLoading: isCreating } = useCreateResourceAttributeAssignment();
    const { deleteAssignment } = useDeleteResourceAttributeAssignment();

    useEffect(() => {
        if (opened && resourceId) {
            $app.logger.info("[ResourceAttributeAssignmentModal] Modal opened for resource", { resourceId });
            fetchResourceAttributes();
            fetchAssignmentsByResourceId(resourceId);
        } else if (!opened) {
            clearAssignments();
            setSelectedAttributeId(null);
        }
    }, [opened, resourceId, fetchResourceAttributes, fetchAssignmentsByResourceId, clearAssignments]);

    const handleAssign = async () => {
        if (!selectedAttributeId || !resourceId) {
            $app.notifications.showWarning(
                notificationResources.warningTitle,
                resources.notifications.selectAttributeToAssign,
            );
            return;
        }

        const org = $app.organization.getOrganization();
        const request: CreateResourceAttributeAssignmentRequest = {
            organizationId: org?.id!,
            resourceId,
            resourceAttributeId: selectedAttributeId,
        };

        $app.logger.info("[ResourceAttributeAssignmentModal] Creating assignment", request);

        try {
            const result = await createAssignment(request);
            if (result) {
                setSelectedAttributeId(null);
                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.attributeAssignSuccess,
                );
                // Refresh assignments
                fetchAssignmentsByResourceId(resourceId);
            } else {
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.attributeAssignFailed,
                );
            }
        } catch (error) {
            $app.logger.error("[ResourceAttributeAssignmentModal] Error assigning attribute:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.attributeAssignErrorWithDetails.replace(
                    "{{details}}",
                    error instanceof Error ? error.message : resources.notifications.unknownError,
                ),
            );
        }
    };

    const handleDelete = async (attributeId: string) => {
        if (!resourceId) return;

        $app.logger.info("[ResourceAttributeAssignmentModal] Deleting assignment", {
            resourceId,
            attributeId,
        });

        try {
            const success = await deleteAssignment(resourceId, attributeId);
            if (success) {
                $app.notifications.showSuccess(
                    notificationResources.successTitle,
                    resources.notifications.assignmentRemoveSuccess,
                );
                // Refresh assignments
                fetchAssignmentsByResourceId(resourceId);
            } else {
                $app.notifications.showError(
                    notificationResources.errorTitle,
                    resources.notifications.assignmentRemoveFailed,
                );
            }
        } catch (error) {
            $app.logger.error("[ResourceAttributeAssignmentModal] Error removing assignment:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.assignmentRemoveErrorWithDetails.replace(
                    "{{details}}",
                    error instanceof Error ? error.message : resources.notifications.unknownError,
                ),
            );
        }
    };

    // Get assigned attribute IDs
    const assignedAttributeIds = resourceAttributeAssignments.map((a) => a.resourceAttributeId);

    // Filter out already assigned attributes
    const availableAttributes = resourceAttributes.filter(
        (attr) => !assignedAttributeIds.includes(attr.id)
    );

    // Get full attribute data for assigned attributes
    const assignedAttributes = resourceAttributeAssignments
        .map((assignment) => {
            const attribute = resourceAttributes.find((a) => a.id === assignment.resourceAttributeId);
            return attribute ? { ...assignment, attributeTitle: attribute.title } : null;
        })
        .filter((a) => a !== null);

    const isLoading = attributesLoading || assignmentsLoading;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={resources.assignmentModal.title.replace("{identifier}", resourceIdentifier || "")}
            size="lg"
        >
            <Stack gap="md">
                {isLoading ? (
                    <Group justify="center" py="xl">
                        <Loader size="md" />
                    </Group>
                ) : (
                    <>
                        {/* Currently Assigned Attributes */}
                        <div>
                            <Text fw={600} size="sm" mb="xs">
                                {resources.assignmentModal.currentlyAssigned}
                            </Text>
                            {assignedAttributes.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    {resources.assignmentModal.noAttributes}
                                </Text>
                            ) : (
                                <Stack gap="xs">
                                    {assignedAttributes.map((assignment) => (
                                        <Group key={assignment.resourceAttributeId} justify="space-between">
                                            <Badge size="lg" variant="light">
                                                {assignment.attributeTitle}
                                            </Badge>
                                            <Button
                                                size="xs"
                                                variant="subtle"
                                                onClick={() => handleDelete(assignment.resourceAttributeId)}
                                            >
                                                {resources.assignmentModal.removeButton}
                                            </Button>
                                        </Group>
                                    ))}
                                </Stack>
                            )}
                        </div>

                        <Divider />

                        {/* Assign New Attribute */}
                        <div>
                            <Text fw={600} size="sm" mb="xs">
                                {resources.assignmentModal.assignNew}
                            </Text>
                            {availableAttributes.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    {resources.assignmentModal.noMoreAttributes}
                                </Text>
                            ) : (
                                <>
                                    <Select
                                        placeholder={resources.assignmentModal.selectPlaceholder}
                                        data={availableAttributes.map((attr) => ({
                                            value: attr.id,
                                            label: attr.title,
                                        }))}
                                        value={selectedAttributeId}
                                        onChange={setSelectedAttributeId}
                                        mb="md"
                                    />
                                    <Button
                                        onClick={handleAssign}
                                        loading={isCreating}
                                        disabled={!selectedAttributeId}
                                        fullWidth
                                    >
                                        {resources.assignmentModal.assignButton}
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>
                        {resources.assignmentModal.closeButton}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
