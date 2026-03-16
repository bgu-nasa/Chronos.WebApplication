import { useEffect, useState, useMemo } from "react";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Table, Button, Text, ActionIcon, Loader } from "@mantine/core";

import {
    useOrganizationPolicies,
    useSchedulingPeriods
} from "@/modules/schedule/src/hooks";

import { OrganizationPolicyEditor } from "./organization-policy-editor";
import resources from "../constraints-page.resources.json";
import styles from "../constraints-page.module.css";

interface OrganizationPoliciesPanelProps {
    readonly isAdmin: boolean;
    readonly openConfirmation: (params: {
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    }) => void;
}

export function OrganizationPoliciesPanel({ openConfirmation }: Readonly<Omit<OrganizationPoliciesPanelProps, 'isAdmin'>>) {
    const [modalOpened, setModalOpened] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Initialize hooks
    const { organizationPolicies, isLoading: policiesLoading, fetchOrganizationPolicies, createOrganizationPolicy, updateOrganizationPolicy, deleteOrganizationPolicy } = useOrganizationPolicies();
    const { schedulingPeriods, isLoading: periodsLoading, fetchSchedulingPeriods } = useSchedulingPeriods();

    const isLoading = policiesLoading || periodsLoading;

    // Initial fetch
    useEffect(() => {
        fetchOrganizationPolicies();
        fetchSchedulingPeriods();
    }, []);

    // Enriched data
    const enrichedData = useMemo(() => {
        return organizationPolicies.map(item => {
            const period = schedulingPeriods.find((p: any) => p.id === item.schedulingPeriodId);

            return {
                ...item,
                periodName: period ? period.name : item.schedulingPeriodId
            };
        });
    }, [organizationPolicies, schedulingPeriods]);

    const handleCreate = () => {
        setEditingItem(null);
        setModalOpened(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setModalOpened(true);
    };

    const handleDelete = (item: any) => {
        openConfirmation({
            title: resources.deleteMessages.deleteOrganizationPolicy,
            message: resources.deleteMessages.confirmDeleteOrganizationPolicy,
            onConfirm: async () => {
                try {
                    await deleteOrganizationPolicy(item.id);

                    // Show success notification
                    $app.notifications.showSuccess(
                        resources.notifications.organizationPolicies.deleted,
                        resources.notifications.organizationPolicies.deletedMessage
                    );
                } catch (error) {
                    $app.logger.error("[OrganizationPoliciesPanel] Error deleting policy:", error);
                    $app.notifications.showError(
                        resources.notifications.organizationPolicies.failedToDelete,
                        error instanceof Error ? error.message : resources.notifications.organizationPolicies.unexpectedError
                    );
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingItem) {
                await updateOrganizationPolicy(editingItem.id, values);
            } else {
                await createOrganizationPolicy(values);
            }

            // Show success notification
            $app.notifications.showSuccess(
                editingItem ? resources.notifications.organizationPolicies.updated : resources.notifications.organizationPolicies.created,
                editingItem
                    ? resources.notifications.organizationPolicies.updatedMessage
                    : resources.notifications.organizationPolicies.createdMessage
            );

            setModalOpened(false);
        } catch (error) {
            $app.logger.error("[OrganizationPoliciesPanel] Error saving policy:", error);
            $app.notifications.showError(
                resources.notifications.organizationPolicies.failedToSavePolicy,
                error instanceof Error ? error.message : resources.notifications.organizationPolicies.unexpectedError
            );
        }
    };

    if (isLoading && enrichedData.length === 0 && !modalOpened) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.buttonGroup}>
                <Button variant="filled" onClick={handleCreate} disabled>
                    {resources.modalTitles.createOrganizationPolicy}
                </Button>
                {isLoading && <Loader size="xs" />}
            </div>

            {enrichedData.length === 0 ? (
                <Text className={styles.emptyState}>
                    {resources.emptyStateMessages.noOrganizationPolicies}
                </Text>
            ) : (
                <Table striped highlightOnHover className={styles.table}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{resources.labels.period}</Table.Th>
                            <Table.Th>{resources.labels.key}</Table.Th>
                            <Table.Th>{resources.labels.value}</Table.Th>
                            <Table.Th>{resources.labels.actions}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {enrichedData.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td>{item.periodName}</Table.Td>
                                <Table.Td>{item.key}</Table.Td>
                                <Table.Td>{item.value}</Table.Td>
                                <Table.Td>
                                    <div className={styles.actionIcons}>
                                        <ActionIcon variant="subtle" onClick={() => handleEdit(item)}>
                                            <HiOutlinePencil />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle" onClick={() => handleDelete(item)}>
                                            <HiOutlineTrash />
                                        </ActionIcon>
                                    </div>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}

            <OrganizationPolicyEditor
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                onSubmit={handleSubmit}
                initialData={editingItem}
                loading={isLoading}
            />
        </div>
    );
}
