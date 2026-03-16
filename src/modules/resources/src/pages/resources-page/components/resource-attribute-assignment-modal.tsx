import { useEffect, useState } from "react";
import { Modal, Button, Select, Stack, Group, Text, Badge, Divider, Loader } from "@mantine/core";
import {
    useResourceAttributes,
    useResourceAttributeAssignments,
    useCreateResourceAttributeAssignment,
    useDeleteResourceAttributeAssignment,
} from "@/modules/resources/src/hooks";
import type { CreateResourceAttributeAssignmentRequest } from "@/modules/resources/src/data";

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
            $app.notifications.showWarning("Warning", "Please select an attribute to assign");
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
                $app.notifications.showSuccess("Success", "Attribute assigned successfully");
                // Refresh assignments
                fetchAssignmentsByResourceId(resourceId);
            } else {
                $app.notifications.showError("Error", "Failed to assign attribute");
            }
        } catch (error) {
            $app.logger.error("[ResourceAttributeAssignmentModal] Error assigning attribute:", error);
            $app.notifications.showError(
                "Error",
                `Error assigning attribute: ${error instanceof Error ? error.message : "Unknown error"}`
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
                $app.notifications.showSuccess("Success", "Assignment removed successfully");
                // Refresh assignments
                fetchAssignmentsByResourceId(resourceId);
            } else {
                $app.notifications.showError("Error", "Failed to remove assignment");
            }
        } catch (error) {
            $app.logger.error("[ResourceAttributeAssignmentModal] Error removing assignment:", error);
            $app.notifications.showError(
                "Error",
                `Error removing assignment: ${error instanceof Error ? error.message : "Unknown error"}`
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
            title={`Assign Attributes to Resource ${resourceIdentifier ? `"${resourceIdentifier}"` : ""}`}
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
                                Currently Assigned Attributes
                            </Text>
                            {assignedAttributes.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    No attributes assigned yet
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
                                                Remove
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
                                Assign New Attribute
                            </Text>
                            {availableAttributes.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                    No more attributes available to assign
                                </Text>
                            ) : (
                                <>
                                    <Select
                                        placeholder="Select an attribute"
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
                                        Assign Attribute
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>
                        Close
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
