import { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Divider, Title, Select } from "@mantine/core";
import { $app } from "@/infra/service";
import { useSchedulingPeriods } from "@/modules/schedule/src/hooks/use-scheduling-periods";
import { useSlots } from "@/modules/schedule/src/hooks/use-slots";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";

import { assignmentDataRepository } from "@/modules/schedule/src/data/assignment-data-repository";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { AssignmentsDataTable } from "@/modules/schedule/src/pages/assignments-page/components/assignments-data-table";
import resources from "./my-assignments-page.resources.json";
import styles from "./my-assignments-page.module.css";

export function MyAssignmentsPage() {
    const currentUserId = $app.organization.getOrganization()?.userRoles?.[0]?.userId ?? null;

    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);

    const [filterResourceId, setFilterResourceId] = useState<string | null>(null);

    const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();
    const { slots, fetchSlots } = useSlots();
    const { activities } = useActivities(selectedPeriodId ?? undefined);
    const { resources: resourceList } = useResources();

    useEffect(() => {
        fetchSchedulingPeriods();
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

    const resourceFilterOptions = useMemo(() => {
        return resourceList.map((r) => ({
            value: r.id,
            label: `${r.location} / ${r.identifier}`,
        }));
    }, [resourceList]);

    const fetchAssignments = useCallback(async (
        periodId: string,
        userId: string | null,
        resourceId?: string | null,
    ) => {
        setIsLoadingAssignments(true);
        try {
            const data = await assignmentDataRepository.getAllAssignments({
                schedulingPeriodId: periodId,
                assignedUserId: userId || undefined,
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
            fetchAssignments(selectedPeriodId, currentUserId, filterResourceId);
            fetchSlots(selectedPeriodId);
            setSelectedAssignment(null);
        }
    }, [selectedPeriodId, currentUserId, filterResourceId]);

    const handlePeriodChange = (value: string | null) => {
        setSelectedPeriodId(value);
        setSelectedAssignment(null);
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
                </div>

                {selectedPeriodId && (
                    <div className={styles.filtersRow}>
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
            </div>
        </Container>
    );
}
