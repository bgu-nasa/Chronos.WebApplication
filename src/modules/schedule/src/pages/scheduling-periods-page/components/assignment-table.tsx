/**
 * Assignment Table Component
 * Displays assignments for a slot in a list format
 */

import { useMemo } from "react";
import { Paper, Text, Stack } from "@mantine/core";
import type { AssignmentResponse } from "@/modules/schedule/src/data/assignment.types";
import { useResources } from "@/modules/schedule/src/hooks/use-resources";
import { useActivities } from "@/modules/schedule/src/hooks/use-activities";
import assignmentResources from "@/modules/schedule/src/pages/scheduling-periods-page/assignment.resources.json";

interface AssignmentTableProps {
    assignments: AssignmentResponse[];
    selectedAssignment: AssignmentResponse | null;
    onSelectionChange: (assignment: AssignmentResponse | null) => void;
    isLoading?: boolean;
}

export function AssignmentTable({
    assignments,
    selectedAssignment,
    onSelectionChange,
    isLoading = false,
}: AssignmentTableProps) {
    const { resources: scheduleResources } = useResources();
    const { activities } = useActivities();

    // Create lookup maps for display names
    const resourceDisplayMap = useMemo(() => {
        return new Map(
            scheduleResources.map((r) => [r.id, `${r.location} / ${r.identifier}`])
        );
    }, [scheduleResources]);

    const activityDisplayMap = useMemo(() => {
        return new Map(
            activities.map((a) => [a.id, a.displayLabel])
        );
    }, [activities]);

    // Get display name for resource ID
    const getResourceDisplay = (resourceId: string) => {
        return resourceDisplayMap.get(resourceId) || resourceId;
    };

    // Get display name for activity ID
    const getActivityDisplay = (activityId: string) => {
        return activityDisplayMap.get(activityId) || activityId;
    };

    if (isLoading) {
        return (
            <Paper p="xl" withBorder>
                <Text c="dimmed" ta="center">{assignmentResources.table.loading}</Text>
            </Paper>
        );
    }

    if (assignments.length === 0) {
        return (
            <Paper p="xl" withBorder>
                <Text c="dimmed" ta="center">{assignmentResources.table.empty}</Text>
            </Paper>
        );
    }

    return (
        <Stack gap="xs">
            {assignments.map((assignment) => (
                <Paper
                    key={assignment.id}
                    p="sm"
                    withBorder
                    onClick={() => onSelectionChange(
                        selectedAssignment?.id === assignment.id ? null : assignment
                    )}
                    style={{
                        cursor: "pointer",
                        backgroundColor: selectedAssignment?.id === assignment.id
                            ? "var(--mantine-primary-color-light)"
                            : undefined,
                        borderColor: selectedAssignment?.id === assignment.id
                            ? "var(--mantine-primary-color-filled)"
                            : undefined,
                    }}
                >
                    <Stack gap={4}>
                        <Text size="sm">
                            <Text span fw={500}>{assignmentResources.table.resourceLabel}</Text> {getResourceDisplay(assignment.resourceId)}
                        </Text>
                        <Text size="sm">
                            <Text span fw={500}>{assignmentResources.table.activityLabel}</Text> {getActivityDisplay(assignment.activityId)}
                        </Text>
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}
