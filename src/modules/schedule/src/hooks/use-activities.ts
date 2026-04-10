/**
 * Activity hooks for Schedule Module
 * React hooks for fetching activities with enriched data for assignment dropdowns
 */

import { useState, useEffect, useCallback } from "react";
import { activityDataRepository } from "@/modules/schedule/src/data/activity-data-repository";
import type { EnrichedActivity } from "@/modules/schedule/src/data/activity.types";

/**
 * Hook for fetching all activities with enriched data (subject name, user name)
 * Display format: "{ActivityType} - {SubjectName} ({FirstName} {LastName})"
 */
export function useActivities(schedulingPeriodId?: string) {
    const [activities, setActivities] = useState<EnrichedActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel
            const [activitiesData, subjectsData, usersData] = await Promise.all([
                schedulingPeriodId 
                    ? activityDataRepository.getActivitiesBySchedulingPeriodAsync(schedulingPeriodId)
                    : activityDataRepository.getAllActivities(),
                activityDataRepository.getAllSubjects(),
                activityDataRepository.getAllUsers(),
            ]);

            // Create lookup maps for fast access
            const subjectMap = new Map(subjectsData.map((s) => [s.id, s]));
            const userMap = new Map(usersData.map((u) => [u.id, u]));

            // Enrich activities with subject and user names
            const enrichedActivities: EnrichedActivity[] = activitiesData.map((activity) => {
                const subject = subjectMap.get(activity.subjectId);
                const user = userMap.get(activity.assignedUserId);

                const subjectName = subject?.name || "Unknown Subject";
                const userFullName = user
                    ? `${user.firstName} ${user.lastName}`
                    : "Unknown User";

                return {
                    id: activity.id,
                    activityType: activity.activityType,
                    subjectName,
                    userFullName,
                    displayLabel: `${activity.activityType} - ${subjectName} (${userFullName}) [${activity.duration}m]`,
                    duration: activity.duration,
                };
            });

            setActivities(enrichedActivities);
        } catch (err) {
            let errorMessage = "Failed to fetch activities";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            $app.logger.error("Error fetching activities:", err);
        } finally {
            setIsLoading(false);
        }
    }, [schedulingPeriodId]);

    // Fetch on mount
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return {
        activities,
        isLoading,
        error,
        refetch: fetchActivities,
    };
}
