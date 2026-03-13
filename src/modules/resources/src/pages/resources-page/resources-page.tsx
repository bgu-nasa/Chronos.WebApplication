import { useState, useEffect } from "react";
import { Container, Divider, Title, Tabs } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { ResourceActions, ResourceTable, ResourceCreator, ResourceEditor, ResourceAttributeAssignmentModal, type ResourceData } from "./components";
import type { UpdateResourceRequest, UpdateResourceTypeRequest, CreateResourceAttributeRequest, UpdateResourceAttributeRequest } from "@/modules/resources/src/data";
import {
    useResources,
    useCreateResource,
    useUpdateResource,
    useDeleteResource,
    useResourceTypes,
    useCreateResourceType,
    useUpdateResourceType,
    useDeleteResourceType,
    useResourceAttributes,
    useCreateResourceAttribute,
    useUpdateResourceAttribute,
    useDeleteResourceAttribute,
} from "@/modules/resources/src/hooks";
import { ResourceTypeActions, ResourceTypeTable, ResourceTypeCreator, ResourceTypeEditor, type ResourceTypeData } from "../resource-types-page/components";
import { ResourceAttributeActions, ResourceAttributeTable, ResourceAttributeCreator, ResourceAttributeEditor, type ResourceAttributeData } from "../resource-attributes-page/components";
import resourcesJson from "./resources-page.resources.json";
import resourceTypesJson from "../resource-types-page/resource-types-page.resources.json";
import resourceAttributesJson from "../resource-attributes-page/resource-attributes-page.resources.json";
import styles from "./resources-page.module.css";

export function ResourcesPage() {
    const [activeTab, setActiveTab] = useState<string | null>("resources");
    
    // Resources state
    const [selectedResource, setSelectedResource] = useState<ResourceData | null>(null);
    const [resourceCreateModalOpened, setResourceCreateModalOpened] = useState(false);
    const [resourceEditModalOpened, setResourceEditModalOpened] = useState(false);
    const [resourceAttributeAssignmentModalOpened, setResourceAttributeAssignmentModalOpened] = useState(false);

    // Resource Types state
    const [selectedResourceType, setSelectedResourceType] = useState<ResourceTypeData | null>(null);
    const [resourceTypeCreateModalOpened, setResourceTypeCreateModalOpened] = useState(false);
    const [resourceTypeEditModalOpened, setResourceTypeEditModalOpened] = useState(false);

    // Resource Attributes state
    const [selectedResourceAttribute, setSelectedResourceAttribute] = useState<ResourceAttributeData | null>(null);
    const [resourceAttributeCreateModalOpened, setResourceAttributeCreateModalOpened] = useState(false);
    const [resourceAttributeEditModalOpened, setResourceAttributeEditModalOpened] = useState(false);

    // Resources hooks
    const { resources: resourcesList, fetchResources } = useResources();
    const { createResource, isLoading: isCreatingResource } = useCreateResource();
    const { updateResource, isLoading: isEditingResource } = useUpdateResource();
    const { deleteResource } = useDeleteResource();

    // Resource Types hooks
    const { resourceTypes, fetchResourceTypes } = useResourceTypes();
    const { createResourceType, isLoading: isCreatingResourceType } = useCreateResourceType();
    const { updateResourceType, isLoading: isEditingResourceType } = useUpdateResourceType();
    const { deleteResourceType } = useDeleteResourceType();

    // Resource Attributes hooks
    const { resourceAttributes, fetchResourceAttributes } = useResourceAttributes();
    const { createResourceAttribute, isLoading: isCreatingResourceAttribute } = useCreateResourceAttribute();
    const { updateResourceAttribute, isLoading: isEditingResourceAttribute } = useUpdateResourceAttribute();
    const { deleteResourceAttribute } = useDeleteResourceAttribute();

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isDeleting,
    } = useConfirmation();

    // Fetch data on mount
    useEffect(() => {
        fetchResources();
        fetchResourceTypes();
        fetchResourceAttributes();
    }, [fetchResources, fetchResourceTypes, fetchResourceAttributes]);

    // Resources handlers
    const handleResourceCreateClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceCreateClick called");
        setResourceCreateModalOpened(true);
    };

    const handleResourceCreateSubmit = async (data: {
        resourceTypeId: string;
        location: string;
        identifier: string;
        capacity: number | null;
    }) => {
        $app.logger.info("[ResourcesPage] handleResourceCreateSubmit called with:", data);

        const org = $app.organization.getOrganization();
        $app.logger.info("[ResourcesPage] Organization from context:", org);

        if (!org?.id) {
            $app.logger.error("[ResourcesPage] No organization context available");
            $app.notifications.showError("Error", "Organization context missing. Please refresh and try again.");
            return;
        }

        const request = {
            id: crypto.randomUUID(),
            organizationId: org.id,
            resourceTypeId: data.resourceTypeId,
            location: data.location,
            identifier: data.identifier,
            capacity: data.capacity,
        };

        $app.logger.info("[ResourcesPage] Sending create request:", request);

        try {
            const result = await createResource(request);
            $app.logger.info("[ResourcesPage] Create resource result:", result);

            if (result) {
                setResourceCreateModalOpened(false);
                $app.notifications.showSuccess("Success", "Resource created successfully");
            } else {
                $app.logger.error("[ResourcesPage] Create resource returned null");
                $app.notifications.showError("Error", "Failed to create resource. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error creating resource:", error);
            $app.notifications.showError("Error", `Error creating resource: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceEditClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceEditClick called");
        if (selectedResource) {
            setResourceEditModalOpened(true);
        }
    };

    const handleResourceEditSubmit = async (data: {
        resourceTypeId: string;
        location: string;
        identifier: string;
        capacity: number | null;
    }) => {
        $app.logger.info("[ResourcesPage] handleResourceEditSubmit called with:", data);

        if (!selectedResource) {
            $app.logger.error("[ResourcesPage] Missing selectedResource");
            $app.notifications.showWarning("Warning", "Missing resource context for edit.");
            return;
        }

        const request: UpdateResourceRequest = {
            resourceTypeId: data.resourceTypeId,
            location: data.location,
            identifier: data.identifier,
            capacity: data.capacity,
        };

        $app.logger.info("[ResourcesPage] Sending update request:", request);

        try {
            const success = await updateResource(selectedResource.id, request);
            $app.logger.info("[ResourcesPage] Update resource result:", success);

            if (success) {
                setResourceEditModalOpened(false);
                setSelectedResource(null);
                $app.notifications.showSuccess("Success", "Resource updated successfully");
            } else {
                $app.logger.error("[ResourcesPage] Update resource returned false");
                $app.notifications.showError("Error", "Failed to update resource. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error updating resource:", error);
            $app.notifications.showError("Error", `Error updating resource: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceDeleteClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceDeleteClick called");
        if (!selectedResource) return;

        openConfirmation({
            title: resourcesJson.deleteConfirmTitle,
            message: resourcesJson.deleteConfirmMessage.replace(
                "{identifier}",
                selectedResource.identifier
            ),
            onConfirm: async () => {
                const success = await deleteResource(selectedResource.id);
                if (success) {
                    setSelectedResource(null);
                }
            },
        });
    };

    const handleResourceAssignAttributesClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceAssignAttributesClick called");
        if (selectedResource) {
            setResourceAttributeAssignmentModalOpened(true);
        }
    };

    // Resource Types handlers
    const handleResourceTypeCreateClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceTypeCreateClick called");
        setResourceTypeCreateModalOpened(true);
    };

    const handleResourceTypeCreateSubmit = async (data: { type: string }) => {
        $app.logger.info("[ResourcesPage] handleResourceTypeCreateSubmit called with:", data);

        const org = $app.organization.getOrganization();
        $app.logger.info("[ResourcesPage] Organization from context:", org);

        if (!org?.id) {
            $app.logger.error("[ResourcesPage] No organization context available");
            $app.notifications.showError("Error", "Organization context missing. Please refresh and try again.");
            return;
        }

        const request = {
            organizationId: org.id,
            type: data.type,
        };

        $app.logger.info("[ResourcesPage] Sending create request:", request);

        try {
            const result = await createResourceType(request);
            $app.logger.info("[ResourcesPage] Create resource type result:", result);

            if (result) {
                setResourceTypeCreateModalOpened(false);
                $app.notifications.showSuccess("Success", "Resource type created successfully");
            } else {
                $app.logger.error("[ResourcesPage] Create resource type returned null");
                $app.notifications.showError("Error", "Failed to create resource type. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error creating resource type:", error);
            $app.notifications.showError("Error", `Error creating resource type: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceTypeEditClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceTypeEditClick called");
        if (selectedResourceType) {
            setResourceTypeEditModalOpened(true);
        }
    };

    const handleResourceTypeEditSubmit = async (data: { type: string }) => {
        $app.logger.info("[ResourcesPage] handleResourceTypeEditSubmit called with:", data);

        if (!selectedResourceType) {
            $app.logger.error("[ResourcesPage] Missing selectedResourceType");
            $app.notifications.showWarning("Warning", "Missing resource type context for edit.");
            return;
        }

        const request: UpdateResourceTypeRequest = {
            type: data.type,
        };

        $app.logger.info("[ResourcesPage] Sending update request:", request);

        try {
            const success = await updateResourceType(selectedResourceType.id, request);
            $app.logger.info("[ResourcesPage] Update resource type result:", success);

            if (success) {
                setResourceTypeEditModalOpened(false);
                setSelectedResourceType(null);
                $app.notifications.showSuccess("Success", "Resource type updated successfully");
            } else {
                $app.logger.error("[ResourcesPage] Update resource type returned false");
                $app.notifications.showError("Error", "Failed to update resource type. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error updating resource type:", error);
            $app.notifications.showError("Error", `Error updating resource type: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceTypeDeleteClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceTypeDeleteClick called");
        if (!selectedResourceType) return;

        openConfirmation({
            title: resourceTypesJson.deleteConfirmTitle,
            message: resourceTypesJson.deleteConfirmMessage.replace(
                "{type}",
                selectedResourceType.type
            ),
            onConfirm: async () => {
                const success = await deleteResourceType(selectedResourceType.id);
                if (success) {
                    setSelectedResourceType(null);
                }
            },
        });
    };

    // Resource Attributes handlers
    const handleResourceAttributeCreateClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceAttributeCreateClick called");
        setResourceAttributeCreateModalOpened(true);
    };

    const handleResourceAttributeCreateSubmit = async (data: { title: string; description: string | null }) => {
        $app.logger.info("[ResourcesPage] handleResourceAttributeCreateSubmit called with:", data);

        const org = $app.organization.getOrganization();
        $app.logger.info("[ResourcesPage] Organization from context:", org);

        const request = {
            id: crypto.randomUUID(),
            organizationId: org?.id!,
            title: data.title,
            description: data.description,
        };

        $app.logger.info("[ResourcesPage] Sending create request:", request);

        try {
            const result = await createResourceAttribute(request);
            $app.logger.info("[ResourcesPage] Create resource attribute result:", result);

            if (result) {
                setResourceAttributeCreateModalOpened(false);
                $app.notifications.showSuccess("Success", "Resource attribute created successfully");
            } else {
                $app.logger.error("[ResourcesPage] Create resource attribute returned null");
                $app.notifications.showError("Error", "Failed to create resource attribute. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error creating resource attribute:", error);
            $app.notifications.showError("Error", `Error creating resource attribute: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceAttributeEditClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceAttributeEditClick called");
        if (selectedResourceAttribute) {
            setResourceAttributeEditModalOpened(true);
        }
    };

    const handleResourceAttributeEditSubmit = async (data: { title: string; description: string | null }) => {
        $app.logger.info("[ResourcesPage] handleResourceAttributeEditSubmit called with:", data);

        if (!selectedResourceAttribute) {
            $app.logger.error("[ResourcesPage] Missing selectedResourceAttribute");
            $app.notifications.showWarning("Warning", "Missing resource attribute context for edit.");
            return;
        }

        const request = {
            title: data.title,
            description: data.description,
        };

        $app.logger.info("[ResourcesPage] Sending update request:", request);

        try {
            const success = await updateResourceAttribute(selectedResourceAttribute.id, request);
            $app.logger.info("[ResourcesPage] Update resource attribute result:", success);

            if (success) {
                setResourceAttributeEditModalOpened(false);
                setSelectedResourceAttribute(null);
                $app.notifications.showSuccess("Success", "Resource attribute updated successfully");
            } else {
                $app.logger.error("[ResourcesPage] Update resource attribute returned false");
                $app.notifications.showError("Error", "Failed to update resource attribute. Check console for details.");
            }
        } catch (error) {
            $app.logger.error("[ResourcesPage] Error updating resource attribute:", error);
            $app.notifications.showError("Error", `Error updating resource attribute: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleResourceAttributeDeleteClick = () => {
        $app.logger.info("[ResourcesPage] handleResourceAttributeDeleteClick called");
        if (!selectedResourceAttribute) return;

        openConfirmation({
            title: resourceAttributesJson.deleteConfirmTitle,
            message: resourceAttributesJson.deleteConfirmMessage.replace(
                "{title}",
                selectedResourceAttribute.title
            ),
            onConfirm: async () => {
                const success = await deleteResourceAttribute(selectedResourceAttribute.id);
                if (success) {
                    setSelectedResourceAttribute(null);
                }
            },
        });
    };

    // Prepare data for display
    const resourceData: ResourceData[] = resourcesList.map((resource) => {
        const resourceType = resourceTypes.find((rt) => rt.id === resource.resourceTypeId);
        return {
            id: resource.id,
            resourceTypeId: resource.resourceTypeId,
            location: resource.location,
            identifier: resource.identifier,
            capacity: resource.capacity,
            resourceTypeName: resourceType?.type || "Unknown",
        };
    });

    const resourceTypeData: ResourceTypeData[] = resourceTypes.map((resourceType) => ({
        id: resourceType.id,
        type: resourceType.type,
    }));

    const resourceAttributeData: ResourceAttributeData[] = resourceAttributes.map((attribute) => ({
        id: attribute.id,
        title: attribute.title,
        description: attribute.description,
    }));

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>Resources Management</Title>
                <Divider className={styles.divider} />

                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="resources">Resources</Tabs.Tab>
                        <Tabs.Tab value="resource-types">Resource Types</Tabs.Tab>
                        <Tabs.Tab value="resource-attributes">Resource Attributes</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="resources" pt="md">
                        <ResourceActions
                            selectedResource={selectedResource}
                            onCreateClick={handleResourceCreateClick}
                            onEditClick={handleResourceEditClick}
                            onDeleteClick={handleResourceDeleteClick}
                            onAssignAttributesClick={handleResourceAssignAttributesClick}
                        />

                        <ResourceTable
                            resources={resourceData}
                            selectedResource={selectedResource}
                            onSelectionChange={setSelectedResource}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="resource-types" pt="md">
                        <ResourceTypeActions
                            selectedResourceType={selectedResourceType}
                            onCreateClick={handleResourceTypeCreateClick}
                            onEditClick={handleResourceTypeEditClick}
                            onDeleteClick={handleResourceTypeDeleteClick}
                        />

                        <ResourceTypeTable
                            resourceTypes={resourceTypeData}
                            selectedResourceType={selectedResourceType}
                            onSelectionChange={setSelectedResourceType}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="resource-attributes" pt="md">
                        <ResourceAttributeActions
                            selectedResourceAttribute={selectedResourceAttribute}
                            onCreateClick={handleResourceAttributeCreateClick}
                            onEditClick={handleResourceAttributeEditClick}
                            onDeleteClick={handleResourceAttributeDeleteClick}
                        />

                        <ResourceAttributeTable
                            resourceAttributes={resourceAttributeData}
                            selectedResourceAttribute={selectedResourceAttribute}
                            onSelectionChange={setSelectedResourceAttribute}
                        />
                    </Tabs.Panel>
                </Tabs>

                {/* Resource Modals */}
                <ResourceCreator
                    opened={resourceCreateModalOpened}
                    onClose={() => setResourceCreateModalOpened(false)}
                    onSubmit={handleResourceCreateSubmit}
                    loading={isCreatingResource}
                />

                <ResourceEditor
                    opened={resourceEditModalOpened}
                    onClose={() => setResourceEditModalOpened(false)}
                    onSubmit={handleResourceEditSubmit}
                    loading={isEditingResource}
                    initialData={
                        selectedResource
                            ? {
                                  resourceTypeId: selectedResource.resourceTypeId,
                                  location: selectedResource.location,
                                  identifier: selectedResource.identifier,
                                  capacity: selectedResource.capacity,
                              }
                            : undefined
                    }
                />

                {/* Resource Type Modals */}
                <ResourceTypeCreator
                    opened={resourceTypeCreateModalOpened}
                    onClose={() => setResourceTypeCreateModalOpened(false)}
                    onSubmit={handleResourceTypeCreateSubmit}
                    loading={isCreatingResourceType}
                />

                <ResourceTypeEditor
                    opened={resourceTypeEditModalOpened}
                    onClose={() => setResourceTypeEditModalOpened(false)}
                    onSubmit={handleResourceTypeEditSubmit}
                    loading={isEditingResourceType}
                    initialData={
                        selectedResourceType
                            ? { type: selectedResourceType.type }
                            : undefined
                    }
                />

                {/* Resource Attribute Modals */}
                <ResourceAttributeCreator
                    opened={resourceAttributeCreateModalOpened}
                    onClose={() => setResourceAttributeCreateModalOpened(false)}
                    onSubmit={handleResourceAttributeCreateSubmit}
                    loading={isCreatingResourceAttribute}
                />

                <ResourceAttributeEditor
                    opened={resourceAttributeEditModalOpened}
                    onClose={() => setResourceAttributeEditModalOpened(false)}
                    onSubmit={handleResourceAttributeEditSubmit}
                    loading={isEditingResourceAttribute}
                    initialData={
                        selectedResourceAttribute
                            ? { 
                                title: selectedResourceAttribute.title,
                                description: selectedResourceAttribute.description
                            }
                            : undefined
                    }
                />

                {/* Resource Attribute Assignment Modal */}
                <ResourceAttributeAssignmentModal
                    opened={resourceAttributeAssignmentModalOpened}
                    onClose={() => setResourceAttributeAssignmentModalOpened(false)}
                    resourceId={selectedResource?.id || null}
                    resourceIdentifier={selectedResource?.identifier}
                />

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={
                        activeTab === "resources"
                            ? resourcesJson.deleteConfirmButton
                            : activeTab === "resource-types"
                            ? resourceTypesJson.deleteConfirmButton
                            : resourceAttributesJson.deleteConfirmButton
                    }
                    cancelText={
                        activeTab === "resources"
                            ? resourcesJson.deleteCancelButton
                            : activeTab === "resource-types"
                            ? resourceTypesJson.deleteCancelButton
                            : resourceAttributesJson.deleteCancelButton
                    }
                    loading={isDeleting}
                />
            </div>
        </Container>
    );
}
