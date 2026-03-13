import { useEffect, useState, useMemo } from "react";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Table, Button, Text, ActionIcon, Loader } from "@mantine/core";

import { useActivities, useSubjects } from "@/modules/resources/src/hooks";
import {
    useActivityConstraints
} from "@/modules/schedule/src/hooks";

import { ActivityConstraintEditor } from "./activity-constraint-editor";
import resources from "../constraints-page.resources.json";
import styles from "../constraints-page.module.css";

interface ActivityConstraintsPanelProps {
    readonly isAdmin: boolean;
    readonly openConfirmation: (params: {
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    }) => void;
}

export function ActivityConstraintsPanel({ openConfirmation }: Readonly<Omit<ActivityConstraintsPanelProps, 'isAdmin'>>) {
    const [modalOpened, setModalOpened] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Initialize hooks
    const { activityConstraints, isLoading: constraintsLoading, fetchActivityConstraints, createActivityConstraint, updateActivityConstraint, deleteActivityConstraint } = useActivityConstraints();
    const { activities, isLoading: activitiesLoading, fetchActivities } = useActivities();
    const { subjects, isLoading: subjectsLoading, fetchSubjects } = useSubjects();

    const isLoading = constraintsLoading || activitiesLoading || subjectsLoading;

    // Initial fetch
    useEffect(() => {
        fetchActivityConstraints();
        fetchActivities();
        fetchSubjects();
    }, []);

    // Enriched data
    const enrichedData = useMemo(() => {
        return activityConstraints.map(item => {
            const activity = activities.find((a: any) => a.id === item.activityId);
            const subject = activity ? subjects.find((s: any) => s.id === activity.subjectId) : null;

            return {
                ...item,
                activityName: activity ? activity.activityType : item.activityId,
                subjectName: subject ? subject.name : resources.other.unknownSubject
            };
        });
    }, [activityConstraints, activities, subjects]);

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
            title: resources.deleteMessages.deleteActivityConstraint,
            message: resources.deleteMessages.confirmDeleteActivityConstraint,
            onConfirm: async () => {
                try {
                    await deleteActivityConstraint(item.id);

                    // Show success notification
                    $app.notifications.showSuccess(
                        resources.notifications.activityConstraints.deleted,
                        resources.notifications.activityConstraints.deletedMessage
                    );
                } catch (error) {
                    $app.logger.error("[ActivityConstraintsPanel] Error deleting constraint:", error);
                    $app.notifications.showError(
                        resources.notifications.activityConstraints.failedToDelete,
                        error instanceof Error ? error.message : resources.notifications.activityConstraints.unexpectedError
                    );
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingItem) {
                await updateActivityConstraint(editingItem.id, values);
            } else {
                await createActivityConstraint(values);
            }

            // Show success notification
            $app.notifications.showSuccess(
                editingItem ? resources.notifications.activityConstraints.updated : resources.notifications.activityConstraints.created,
                editingItem
                    ? resources.notifications.activityConstraints.updatedMessage
                    : resources.notifications.activityConstraints.createdMessage
            );

            setModalOpened(false);
        } catch (error) {
            $app.logger.error("[ActivityConstraintsPanel] Error saving constraint:", error);
            $app.notifications.showError(
                resources.notifications.activityConstraints.failedToSaveConstraint,
                error instanceof Error ? error.message : resources.notifications.activityConstraints.unexpectedError
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
                <Button variant="filled" onClick={handleCreate}>
                    {resources.modalTitles.createActivityConstraint}
                </Button>
                {isLoading && <Loader size="xs" />}
            </div>

            {enrichedData.length === 0 ? (
                <Text className={styles.emptyState}>
                    {resources.emptyStateMessages.noActivityConstraints}
                </Text>
            ) : (
                <Table striped highlightOnHover className={styles.table}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{resources.labels.subject}</Table.Th>
                            <Table.Th>{resources.labels.activity}</Table.Th>
                            <Table.Th>{resources.labels.key}</Table.Th>
                            <Table.Th>{resources.labels.value}</Table.Th>
                            <Table.Th>{resources.labels.actions}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {enrichedData.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td>{item.subjectName}</Table.Td>
                                <Table.Td>{item.activityName}</Table.Td>
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

            <ActivityConstraintEditor
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                onSubmit={handleSubmit}
                initialData={editingItem}
                loading={isLoading}
            />
        </div>
    );
}
