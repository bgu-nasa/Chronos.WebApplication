import { useEffect, useState } from "react";
import { Container, Divider, Title, Button, Text, Group } from "@mantine/core";
import { useNavigate, useSearchParams } from "react-router";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { ActivityActions } from "./components/activity-actions";
import { ActivityTable } from "./components/activity-table/activity-table";
import { ActivityCreator } from "./components/activity-creator";
import { ActivityEditor } from "./components/activity-editor";
import type { ActivityData } from "./components/activity-table/types";
import type { CreateActivityRequest, UpdateActivityRequest } from "@/modules/resources/src/data";
import {
    useActivities,
    useCreateActivity,
    useUpdateActivity,
    useDeleteActivity,
} from "@/modules/resources/src/hooks";
import resources from "./activities-page.resources.json";
import styles from "./activities-page.module.css";
import { userRepository } from "@/modules/resources/src/data";

export function ActivitiesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const subjectId = searchParams.get("subjectId");
    const departmentId = searchParams.get("departmentId");
    
    const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
    
    const { activities, fetchActivities, setCurrentDepartment, isLoading } = useActivities();
    const { createActivity, isLoading: isCreating } = useCreateActivity();
    const { updateActivity, isLoading: isEditing } = useUpdateActivity();
    const { deleteActivity } = useDeleteActivity();
    
    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    // Fetch user names for activities
    useEffect(() => {
        const loadUserNames = async () => {
            const uniqueUserIds = new Set(
                activities
                    .map((a) => a.assignedUserId)
                    .filter((id) => id && id.trim().length > 0)
            );

            $app.logger.info("[ActivitiesPage] Unique user IDs to fetch:", Array.from(uniqueUserIds));

            const namesMap = new Map<string, string>();
            
            for (const userId of uniqueUserIds) {
                try {
                    const user = await userRepository.getById(userId);
                    const fullName = `${user.firstName} ${user.lastName}`;
                    namesMap.set(userId, fullName);
                    $app.logger.info("[ActivitiesPage] Fetched user:", { userId, fullName });
                } catch (error) {
                    $app.logger.error("[ActivitiesPage] Error fetching user:", { userId, error });
                    namesMap.set(userId, "Unknown User");
                }
            }
            
            setUserNames(namesMap);
            $app.logger.info("[ActivitiesPage] All user names loaded:", Array.from(namesMap.entries()));
        };

        if (activities.length > 0) {
            loadUserNames();
        }
    }, [activities]);

    // Load activities when page loads
    useEffect(() => {
        $app.logger.info("[ActivitiesPage] Initializing with:", { subjectId, departmentId });
        
        if (departmentId) {
            setCurrentDepartment(departmentId);
            fetchActivities();
        } else {
            $app.logger.warn("[ActivitiesPage] No departmentId in URL params");
        }
    }, [departmentId, fetchActivities, setCurrentDepartment]);

    const handleBackClick = () => {
        navigate("/resources/subjects");
    };

    const handleCreateClick = () => {
        if (!subjectId || !departmentId) {
            $app.notifications.showWarning("Warning", "Missing subject or department context");
            return;
        }
        setCreateModalOpened(true);
    };

    const handleCreateSubmit = async (data: { 
        activityType: string; 
        assignedUserId: string; 
        expectedStudents: number | null;
        duration: number;
    }) => {
        $app.logger.info("[ActivitiesPage] handleCreateSubmit called with:", data);
        
        if (!subjectId || !departmentId) {
            $app.logger.error("[ActivitiesPage] Missing subjectId or departmentId");
            $app.notifications.showWarning("Warning", "Missing subject or department context");
            return;
        }

        const org = $app.organization.getOrganization();
        $app.logger.info("[ActivitiesPage] Organization from context:", org);

        if (!org?.id) {
            $app.logger.error("[ActivitiesPage] No organization context available");
            $app.notifications.showError("Error", "Organization context missing. Please refresh and try again.");
            return;
        }

        const request: CreateActivityRequest = {
            id: crypto.randomUUID(),
            organizationId: org.id,
            subjectId: subjectId,
            assignedUserId: data.assignedUserId || "",
            activityType: data.activityType,
            expectedStudents: data.expectedStudents,
            duration: data.duration,
        };

        $app.logger.info("[ActivitiesPage] Sending create request:", request);

        try {
            const result = await createActivity(subjectId, request);
            $app.logger.info("[ActivitiesPage] Create activity result:", result);
            
            if (result) {
                setCreateModalOpened(false);
                $app.notifications.showSuccess("Success", "Activity created successfully");
                fetchActivities();
            } else {
                $app.logger.error("[ActivitiesPage] Create activity returned null");
                setCreateModalOpened(false);
                $app.notifications.showError("Error", "Failed to create activity. Please check the console for details.");
            }
        } catch (error) {
            $app.logger.error("[ActivitiesPage] Error creating activity:", error);
            setCreateModalOpened(false);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            $app.notifications.showError("Error", `Error creating activity: ${errorMessage}`);
        }
    };

    const handleEditClick = () => {
        if (selectedActivity) {
            setEditModalOpened(true);
        }
    };

    const handleEditSubmit = async (data: {
        activityType: string;
        assignedUserId: string;
        expectedStudents: number | null;
        duration: number;
    }) => {
        $app.logger.info("[ActivitiesPage] handleEditSubmit called with:", data);
        $app.logger.info("[ActivitiesPage] selectedActivity:", selectedActivity);
        
        if (!selectedActivity || !subjectId || !departmentId) {
            $app.logger.error("[ActivitiesPage] Missing selectedActivity, subjectId, or departmentId");
            $app.notifications.showWarning("Warning", "Missing required context for edit");
            return;
        }

        const org = $app.organization.getOrganization();
        $app.logger.info("[ActivitiesPage] Organization from context:", org);

        if (!org?.id) {
            $app.logger.error("[ActivitiesPage] No organization context available");
            $app.notifications.showError("Error", "Organization context missing. Please refresh and try again.");
            return;
        }

        const request: UpdateActivityRequest = {
            organizationId: org.id,
            subjectId: subjectId,
            assignedUserId: data.assignedUserId || "",
            activityType: data.activityType,
            expectedStudents: data.expectedStudents,
            duration: data.duration,
        };

        $app.logger.info("[ActivitiesPage] Sending update request:", request);

        try {
            const success = await updateActivity(selectedActivity.id, request);
            $app.logger.info("[ActivitiesPage] Update activity result:", success);
            
            if (success) {
                setEditModalOpened(false);
                setSelectedActivity(null);
                $app.notifications.showSuccess("Success", "Activity updated successfully");
                fetchActivities();
            } else {
                $app.logger.error("[ActivitiesPage] Update activity returned false");
                setEditModalOpened(false);
                $app.notifications.showError("Error", "Failed to update activity. Please check the console for details.");
            }
        } catch (error) {
            $app.logger.error("[ActivitiesPage] Error updating activity:", error);
            setEditModalOpened(false);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            $app.notifications.showError("Error", `Error updating activity: ${errorMessage}`);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedActivity) {
            return;
        }

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage,
            onConfirm: async () => {
                $app.logger.info("[ActivitiesPage] Deleting activity:", selectedActivity.id);
                const success = await deleteActivity(selectedActivity.id);
                if (success) {
                    setSelectedActivity(null);
                }
            },
        });
    };

    // Filter activities for the current subject
    const subjectActivities: ActivityData[] = activities
        .filter((activity) => activity.subjectId === subjectId)
        .map((activity) => {
            const isUnassigned = !activity.assignedUserId || activity.assignedUserId.trim().length === 0;
            const userName = isUnassigned 
                ? "Unassigned" 
                : userNames.get(activity.assignedUserId) || "Loading...";
            
            return {
                id: activity.id,
                activityType: activity.activityType,
                assignedUserId: activity.assignedUserId,
                assignedUserName: userName,
                expectedStudents: activity.expectedStudents || 0,
                duration: activity.duration,
            };
        });

    $app.logger.info("[ActivitiesPage] Filtered subject activities:", subjectActivities.length);

    if (!subjectId) {
        return (
            <Container size="xl" py="xl">
                <Title order={1}>No course selected</Title>
                <Button onClick={handleBackClick} mt="md">
                    {resources.backToSubjects}
                </Button>
            </Container>
        );
    }

    if (!departmentId) {
        return (
            <Container size="xl" py="xl">
                <Title order={1}>Missing Department Context</Title>
                <Text>Department ID is required to load groups.</Text>
                <Button onClick={handleBackClick} mt="md">
                    {resources.backToSubjects}
                </Button>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <Group justify="space-between" mb="md">
                    <ActivityActions
                        selectedActivity={selectedActivity}
                        onCreateClick={handleCreateClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                    />
                    <Button variant="outline" onClick={handleBackClick}>
                        {resources.backToSubjects}
                    </Button>
                </Group>

                <ActivityTable
                    activities={subjectActivities}
                    selectedActivity={selectedActivity}
                    onSelectionChange={setSelectedActivity}
                    loading={isLoading}
                />

                <ActivityCreator
                    opened={createModalOpened}
                    onClose={() => setCreateModalOpened(false)}
                    onSubmit={handleCreateSubmit}
                    loading={isCreating}
                />

                <ActivityEditor
                    opened={editModalOpened}
                    onClose={() => setEditModalOpened(false)}
                    onSubmit={handleEditSubmit}
                    loading={isEditing}
                    initialData={
                        selectedActivity
                            ? {
                                  activityType: selectedActivity.activityType,
                                  assignedUserId: selectedActivity.assignedUserId,
                                  expectedStudents: selectedActivity.expectedStudents || 0,
                                  duration: selectedActivity.duration,
                              }
                            : undefined
                    }
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
