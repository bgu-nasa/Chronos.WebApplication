import { useState, useEffect, useMemo } from "react";
import { Box, Flex, Paper, Group } from "@mantine/core";

import { WeekView } from "@/common/components/calendar";
import { useUsers } from "@/modules/auth/src/hooks";
import { useUserConstraints, useSchedulingPeriods } from "@/modules/schedule/src/hooks";
import { serializeForbiddenTimeRange, parseForbiddenTimeRange, type ForbiddenTimeRangeEntry } from "@/modules/schedule/src/pages/constraints-page/utils";
import { assignmentDataRepository, activityDataRepository, slotDataRepository, type AssignmentResponse, type ActivityResponse, type SubjectResponse, type SlotResponse } from "@/modules/schedule/src/data";
import { SchedulingPeriodSelect, TimeRangeSelectionModal, UserSelect, EventDetailsModal } from "./components";
import styles from "./calendar-page.module.css";
import resources from "./calendar-page.resources.json";

interface TimeRangeSelection {
  date: Date;
  startTime: string;
  endTime: string;
}

export function CalendarPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timeRangeSelection, setTimeRangeSelection] = useState<TimeRangeSelection | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);

  interface EventBlock {
    weekday: string;
    startTime: string;
    endTime: string;
    activityId?: string;
    activityType?: string;
    subjectName?: string;
    assignmentId?: string;
    slotId?: string;
    resourceId?: string;
  }
  const [selectedEvent, setSelectedEvent] = useState<EventBlock | null>(null);
  const [eventModalOpened, setEventModalOpened] = useState(false);

  const { createUserConstraint, fetchUserConstraintsByUser, userConstraints, isLoading } = useUserConstraints();
  const { schedulingPeriods, fetchSchedulingPeriods } = useSchedulingPeriods();
  const { fetchUsers } = useUsers();

  // Initialize user and admin status
  useEffect(() => {
    const org = $app.organization.getOrganization();
    const userId = org?.userRoles?.[0]?.userId;
    const userIsAdmin = $app.organization.isAdministrator();

    if (userId) {
      setCurrentUserId(userId);
      // For non-admin users, set and lock the user selection
      if (!userIsAdmin) {
        setSelectedUserId(userId);
      }
    }
    setIsAdmin(userIsAdmin);

    // Fetch all users if admin
    if (userIsAdmin) {
      fetchUsers();
    }
  }, [fetchUsers]);

  // Fetch scheduling periods and set default
  useEffect(() => {
    fetchSchedulingPeriods();
  }, [fetchSchedulingPeriods]);

  // Set default scheduling period to the most current active one
  useEffect(() => {
    if (schedulingPeriods.length > 0 && !selectedPeriodId) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Filter out ended periods (toDate < today)
      const activePeriods = schedulingPeriods.filter((period) => {
        const toDate = new Date(period.toDate);
        toDate.setHours(0, 0, 0, 0);
        return toDate >= now;
      });

      if (activePeriods.length > 0) {
        // Sort by fromDate ascending and pick the one with the earliest start time
        const sortedPeriods = [...activePeriods].sort((a, b) => {
          const dateA = new Date(a.fromDate).getTime();
          const dateB = new Date(b.fromDate).getTime();
          return dateA - dateB;
        });

        setSelectedPeriodId(sortedPeriods[0].id);
      }
    }
  }, [schedulingPeriods, selectedPeriodId]);

  // Fetch constraints based on user role and selection
  useEffect(() => {
    if (isAdmin && selectedUserId) {
      fetchUserConstraintsByUser(selectedUserId);
    } else if (!isAdmin && currentUserId) {
      fetchUserConstraintsByUser(currentUserId);
    }
  }, [isAdmin, selectedUserId, currentUserId, fetchUserConstraintsByUser]);

  // Fetch assignments, activities, and slots for events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedPeriodId) {
        setAssignments([]);
        setActivities([]);
        setSlots([]);
        return;
      }

      try {
        // Fetch all data in parallel
        const [assignmentsData, activitiesData, slotsData, subjectsData] = await Promise.all([
          assignmentDataRepository.getAllAssignments(),
          activityDataRepository.getAllActivities(),
          slotDataRepository.getSlots(selectedPeriodId),
          activityDataRepository.getAllSubjects(),
        ]);

        setAssignments(assignmentsData);
        setActivities(activitiesData);
        setSlots(slotsData);
        setSubjects(subjectsData);
      } catch (error) {
        $app.logger.error("[CalendarPage] Error fetching events:", error);
        setAssignments([]);
        setActivities([]);
        setSlots([]);
        setSubjects([]);
      }
    };

    fetchEvents();
  }, [selectedPeriodId]);

  // Convert constraints to visualizations
  const constraintVisualizations = useMemo(() => {
    if (isAdmin && !selectedUserId) {
      return [];
    }

    const userIdToShow = isAdmin ? selectedUserId : currentUserId;
    if (!userIdToShow || !selectedPeriodId) {
      return [];
    }

    // Filter constraints for the selected user and period
    const relevantConstraints = userConstraints.filter(
      (c) => c.userId === userIdToShow &&
        c.schedulingPeriodId === selectedPeriodId &&
        c.key === "forbidden_timerange"
    );

    // Parse and flatten all constraint entries
    const visualizations: Array<{ weekday: string; startTime: string; endTime: string }> = [];

    for (const constraint of relevantConstraints) {
      const entries = parseForbiddenTimeRange(constraint.value);
      visualizations.push(...entries);
    }

    return visualizations;
  }, [userConstraints, isAdmin, selectedUserId, currentUserId, selectedPeriodId]);

  // Convert user events to visualizations
  const eventBlockVisualizations = useMemo(() => {
    if (isAdmin && !selectedUserId) {
      return [];
    }

    const userIdToShow = isAdmin ? selectedUserId : currentUserId;
    if (!userIdToShow || !selectedPeriodId || assignments.length === 0 || activities.length === 0 || slots.length === 0 || subjects.length === 0) {
      return [];
    }

    // Create maps for quick lookup
    const slotMap = new Map(slots.map(s => [s.id, s]));
    const activityMap = new Map(activities.map(a => [a.id, a]));
    const subjectMap = new Map(subjects.map(s => [s.id, s]));

    // Filter assignments for the selected user's activities
    const userActivityIds = new Set(
      activities
        .filter(a => a.assignedUserId === userIdToShow)
        .map(a => a.id)
    );

    // Get slots for user's assignments with activity and subject info
    const userEventBlocks = assignments
      .filter(a => userActivityIds.has(a.activityId))
      .map(a => {
        const slot = slotMap.get(a.slotId);
        const activity = activityMap.get(a.activityId);
        const subject = activity ? subjectMap.get(activity.subjectId) : undefined;

        if (!slot || slot?.schedulingPeriodId !== selectedPeriodId) {
          return null;
        }

        return {
          weekday: slot.weekday,
          startTime: slot.fromTime,
          endTime: slot.toTime,
          activityId: a.activityId,
          activityType: activity?.activityType,
          subjectName: subject?.name,
          assignmentId: a.id,
          slotId: slot.id,
          resourceId: a.resourceId,
        };
      })
      .filter((block): block is NonNullable<typeof block> => block !== null);

    return userEventBlocks;
  }, [assignments, activities, slots, subjects, isAdmin, selectedUserId, currentUserId, selectedPeriodId]);

  const handleTimeRangeSelect = (selection: { date: Date; startTime: string; endTime: string }) => {
    // Only allow selection if a scheduling period is selected
    if (!selectedPeriodId) {
      return;
    }
    setTimeRangeSelection(selection);
    setModalOpened(true);
  };

  const handleConfirmConstraint = async () => {
    if (!timeRangeSelection || !selectedPeriodId || !currentUserId) {
      return;
    }

    try {
      // Get weekday name from the date (in user's local timezone)
      const weekdayName = timeRangeSelection.date.toLocaleDateString('en-US', { weekday: 'long' });

      // Create the constraint entry (times are in user's local timezone)
      const entry: ForbiddenTimeRangeEntry = {
        weekday: weekdayName,
        startTime: timeRangeSelection.startTime, // Local time
        endTime: timeRangeSelection.endTime, // Local time
      };

      // Serialize to backend format (converts local time to UTC automatically)
      const value = serializeForbiddenTimeRange([entry]);

      // Create the constraint
      await createUserConstraint({
        userId: currentUserId,
        schedulingPeriodId: selectedPeriodId,
        key: "forbidden_timerange",
        value: value,
      });

      // Refresh constraints to show the new one
      if (isAdmin && selectedUserId) {
        await fetchUserConstraintsByUser(selectedUserId);
      } else if (!isAdmin && currentUserId) {
        await fetchUserConstraintsByUser(currentUserId);
      }

      // Show success notification
      $app.notifications.showSuccess(
        resources.notifications.constraintCreated.title,
        resources.notifications.constraintCreated.message
      );

      // Close modal and reset selection
      setModalOpened(false);
      setTimeRangeSelection(null);
    } catch (error) {
      $app.logger.error("[CalendarPage] Error creating constraint:", error);
      $app.notifications.showError(
        resources.notifications.constraintCreateFailed.title,
        error instanceof Error ? error.message : resources.notifications.constraintCreateFailed.message
      );
    }
  };

  return (
    <Flex className={styles.calendarPageContainer} direction="column" gap="md">
      <Paper withBorder p="md" className={styles.topBar}>
        <Group
          gap="md"
          align="flex-start"
          className={styles.controlsGroup}
          wrap="wrap"
        >
          <Box className={styles.controlItem}>
            <SchedulingPeriodSelect value={selectedPeriodId} onChange={setSelectedPeriodId} />
          </Box>
          {isAdmin ? (
            <Box className={styles.controlItem}>
              <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
            </Box>
          ) : (
            <Box className={styles.controlItem}>
              <UserSelect value={selectedUserId} onChange={() => { }} disabled />
            </Box>
          )}
        </Group>
      </Paper>
      <Box className={styles.content}>
        <WeekView
          events={[]}
          constraints={constraintVisualizations}
          eventBlocks={eventBlockVisualizations}
          onTimeRangeSelect={handleTimeRangeSelect}
          onEventBlockClick={(eventBlock) => {
            setSelectedEvent(eventBlock);
            setEventModalOpened(true);
          }}
        />
      </Box>

      {timeRangeSelection && (
        <TimeRangeSelectionModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setTimeRangeSelection(null);
          }}
          onConfirm={handleConfirmConstraint}
          date={timeRangeSelection.date}
          startTime={timeRangeSelection.startTime}
          endTime={timeRangeSelection.endTime}
          loading={isLoading}
        />
      )}

      <EventDetailsModal
        opened={eventModalOpened}
        onClose={() => {
          setEventModalOpened(false);
          setSelectedEvent(null);
        }}
        eventBlock={selectedEvent}
      />
    </Flex>
  );
}
