/** @author noamarg */
import React, { useState, useMemo } from 'react';
import { Box, Button, Group, Text, Paper } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';

import type { CalendarEvent } from "@/common/types";

import { WeekHeader, TimeGrid } from './';
import styles from './week-view.module.css';
import resources from './week-view.resources.json';

interface ConstraintVisualization {
  weekday: string;
  startTime: string;
  endTime: string;
}

interface EventBlock extends ConstraintVisualization {
  activityId?: string;
  activityType?: string;
  subjectName?: string;
  assignmentId?: string;
  slotId?: string;
  resourceId?: string;
}

interface WeekViewProps {
  initialDate?: Date;
  events: CalendarEvent[];
  constraints?: ConstraintVisualization[];
  eventBlocks?: EventBlock[];
  dayStartHour?: number;
  dayEndHour?: number;
  onTimeRangeSelect?: (selection: { date: Date; startTime: string; endTime: string }) => void;
  onEventBlockClick?: (eventBlock: EventBlock) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  initialDate = new Date(),
  events,
  constraints = [],
  eventBlocks = [],
  dayStartHour = resources.config.defaultStartHour,
  dayEndHour = resources.config.defaultEndHour,
  onTimeRangeSelect,
  onEventBlockClick
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Calculate dates for the current week (starting Sunday)
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  useHotkeys([
    ['t', handleToday],
    ['ArrowLeft', handlePreviousWeek],
    ['ArrowRight', handleNextWeek],
  ]);

  const monthLabel = weekDates[0].toLocaleString('default', { month: 'long', year: 'numeric' });

  const hoursPerDay = Math.max(1, dayEndHour - dayStartHour);

  return (
    <Paper shadow="xs" p="md" withBorder className={styles.weekViewPaper}>
      <Group justify="space-between" mb="md">
        <Group>
          <Button variant="default" onClick={handleToday}>{resources.navigation.today}</Button>
          <Group gap={4}>
            <Button variant="subtle" size="compact-md" onClick={handlePreviousWeek}>{resources.navigation.prev}</Button>
            <Button variant="subtle" size="compact-md" onClick={handleNextWeek}>{resources.navigation.next}</Button>
          </Group>
          <Text size="xl" fw={700}>{monthLabel}</Text>
        </Group>
      </Group>

      <Box className={styles.navigationContainer}>
        <WeekHeader weekDates={weekDates} />
        <TimeGrid
          weekDates={weekDates}
          events={events}
          constraints={constraints}
          eventBlocks={eventBlocks}
          dayStartHour={dayStartHour}
          hoursPerDay={hoursPerDay}
          hourHeight={resources.config.hourHeight || 60}
          onTimeRangeSelect={onTimeRangeSelect}
          onEventBlockClick={onEventBlockClick}
        />
      </Box>
    </Paper>
  );
};
