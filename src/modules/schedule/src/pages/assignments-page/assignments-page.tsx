import { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Divider, Title, Select, Button, Group } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks/use-scheduling-periods";
import { useSlots } from "@/modules/schedule/src/hooks/use-slots";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";
import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import { activityDataRepository } from "@/modules/schedule/src/data/activity-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import type { UserResponse } from "@/modules/schedule/src/data/activity.types";
import { AssignmentsDataTable } from "./components/assignments-data-table";
import { AddAssignmentModal } from "./components/add-assignment-modal";
import resources from "./assignments-page.resources.json";
import styles from "./assignments-page.module.css";

export function AssignmentsPage() {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null);

    const [filterUserId, setFilterUserId] = useState<string | null>(null);
    const [filterActivityId, setFilterActivityId] = useState<string | null>(null);
    const [filterResourceId, setFilterResourceId] = useState<string | null>(null);
    const [users, setUsers] = useState<UserResponse[]>([]);

    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();
    const { slots, fetchSlots } = useSlots();
    const { activities } = useActivities(selectedPeriodId ?? undefined);
    const { resources: resourceList } = useResources();

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    useEffect(() => {
        fetchSchedulingPeriods();
        activityDataRepository.getAllUsers().then(setUsers).catch(() => {});
    }, []);

    const sortedPeriods = useMemo(() => {
        return [...schedulingPeriods].sort(
            (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );
    }, [schedulingPeriods]);

    useEffect(() => {
        if (sortedPeriods.length > 0 && !selectedPeriodId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const closestActive = sortedPeriods.find((p) => {
                const toDate = new Date(p.toDate);
                toDate.setHours(0, 0, 0, 0);
                return toDate >= today;
            });

            if (closestActive) {
                setSelectedPeriodId(closestActive.id);
            } else {
                setSelectedPeriodId(sortedPeriods[sortedPeriods.length - 1].id);
            }
        }
    }, [sortedPeriods]);

    const periodOptions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return sortedPeriods.map((p) => {
            const toDate = new Date(p.toDate);
            toDate.setHours(0, 0, 0, 0);
            const isEnded = toDate < today;

            return {
                value: p.id,
                label: isEnded ? `${p.name} (ended)` : p.name,
            };
        });
    }, [sortedPeriods]);

    const isSelectedPeriodEnded = useMemo(() => {
        if (!selectedPeriodId) return false;
        const period = sortedPeriods.find((p) => p.id === selectedPeriodId);
        if (!period) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const toDate = new Date(period.toDate);
        toDate.setHours(0, 0, 0, 0);
        return toDate < today;
    }, [selectedPeriodId, sortedPeriods]);

    const userOptions = useMemo(() => {
        return users.map((u) => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName}`,
        }));
    }, [users]);

    const activityFilterOptions = useMemo(() => {
        return activities.map((a) => ({
            value: a.id,
            label: a.displayLabel,
        }));
    }, [activities]);

    const resourceFilterOptions = useMemo(() => {
        return resourceList.map((r) => ({
            value: r.id,
            label: `${r.location} / ${r.identifier}`,
        }));
    }, [resourceList]);

    const fetchAssignments = useCallback(async (
        periodId: string,
        userId?: string | null,
        activityId?: string | null,
        resourceId?: string | null,
    ) => {
        setIsLoadingAssignments(true);
        try {
            const data = await assignmentDataRepository.getAllAssignments({
                schedulingPeriodId: periodId,
                assignedUserId: userId || undefined,
                activityId: activityId || undefined,
                resourceId: resourceId || undefined,
            });
            setAssignments(data);
        } catch (err) {
            $app.logger.error("Failed to fetch assignments:", err);
            $app.notifications.showError("Error", "Failed to fetch assignments");
            setAssignments([]);
        } finally {
            setIsLoadingAssignments(false);
        }
    }, []);

    useEffect(() => {
        if (selectedPeriodId) {
            fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
            fetchSlots(selectedPeriodId);
            setSelectedAssignment(null);
        }
    }, [selectedPeriodId, filterUserId, filterActivityId, filterResourceId]);

    const handlePeriodChange = (value: string | null) => {
        setSelectedPeriodId(value);
        setSelectedAssignment(null);
        setFilterActivityId(null);
    };

    const handleAddClick = () => {
        setEditingAssignment(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = () => {
        if (selectedAssignment) {
            setEditingAssignment(selectedAssignment);
            setIsAddModalOpen(true);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedAssignment) return;

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage,
            onConfirm: async () => {
                try {
                    await assignmentDataRepository.deleteAssignment(selectedAssignment.id);
                    setSelectedAssignment(null);
                    $app.notifications.showSuccess("Success", "Assignment deleted successfully");
                    if (selectedPeriodId) {
                        fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
                    }
                } catch {
                    $app.notifications.showError("Error", "Failed to delete assignment");
                }
            },
        });
    };

    const handleAssignmentCreated = () => {
        if (selectedPeriodId) {
            fetchAssignments(selectedPeriodId, filterUserId, filterActivityId, filterResourceId);
        }
    };

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <div className={styles.headerRow}>
                    <div className={styles.periodSelect}>
                        <Select
                            label={resources.schedulingPeriodLabel}
                            placeholder={resources.schedulingPeriodPlaceholder}
                            data={periodOptions}
                            value={selectedPeriodId}
                            onChange={handlePeriodChange}
                            searchable
                            nothingFoundMessage={resources.noPeriodsMessage}
                        />
                    </div>

                    <Group>
                        <Button onClick={handleAddClick} disabled={!selectedPeriodId || isSelectedPeriodEnded}>
                            {resources.addAssignmentButton}
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleEditClick}
                            disabled={!selectedAssignment || isSelectedPeriodEnded}
                        >
                            {resources.editButton}
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleDeleteClick}
                            disabled={!selectedAssignment || isSelectedPeriodEnded}
                        >
                            {resources.deleteButton}
                        </Button>
                    </Group>
                </div>

                {selectedPeriodId && (
                    <div className={styles.filtersRow}>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.userFilterLabel}
                                placeholder={resources.userFilterPlaceholder}
                                data={userOptions}
                                value={filterUserId}
                                onChange={setFilterUserId}
                                searchable
                                clearable
                            />
                        </div>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.activityFilterLabel}
                                placeholder={resources.activityFilterPlaceholder}
                                data={activityFilterOptions}
                                value={filterActivityId}
                                onChange={setFilterActivityId}
                                searchable
                                clearable
                            />
                        </div>
                        <div className={styles.filterSelect}>
                            <Select
                                label={resources.resourceFilterLabel}
                                placeholder={resources.resourceFilterPlaceholder}
                                data={resourceFilterOptions}
                                value={filterResourceId}
                                onChange={setFilterResourceId}
                                searchable
                                clearable
                            />
                        </div>
                    </div>
                )}

                {selectedPeriodId && (
                    <AssignmentsDataTable
                        assignments={assignments}
                        slots={slots}
                        activities={activities}
                        resourceList={resourceList}
                        selectedAssignment={selectedAssignment}
                        onSelectionChange={setSelectedAssignment}
                        isLoading={isLoadingAssignments}
                    />
                )}

                <AddAssignmentModal
                    opened={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingAssignment(null);
                    }}
                    slots={slots}
                    activities={activities}
                    resourceList={resourceList}
                    onCreated={handleAssignmentCreated}
                    editingAssignment={editingAssignment}
                />

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={resources.deleteConfirmButton}
                    cancelText={resources.deleteCancelButton}
                    loading={isConfirming}
                />
            </div>
        </Container>
    );
}
