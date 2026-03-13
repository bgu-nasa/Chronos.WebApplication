/** @author noamarg */
import React from 'react';
import { Box, ScrollArea } from '@mantine/core';

import type { CalendarEvent } from "@/common/types";

import { TimeColumn, DayColumn } from './';
import styles from './time-grid.module.css';

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

interface TimeGridProps {
  weekDates: Date[];
  events: CalendarEvent[];
  constraints?: ConstraintVisualization[];
  eventBlocks?: EventBlock[];
  hourHeight?: number;
  dayStartHour?: number;
  hoursPerDay?: number;
  onTimeRangeSelect?: (selection: { date: Date; startTime: string; endTime: string }) => void;
  onEventBlockClick?: (eventBlock: EventBlock) => void;
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  weekDates,
  events,
  constraints = [],
  eventBlocks = [],
  hourHeight,
  dayStartHour = 0,
  hoursPerDay = 24,
  onTimeRangeSelect,
  onEventBlockClick
}) => {
  return (
    <ScrollArea className={styles.scrollArea} type="auto">
      <Box className={styles.gridContent}>
        <TimeColumn
          hourHeight={hourHeight}
          dayStartHour={dayStartHour}
          hoursPerDay={hoursPerDay}
        />

        {weekDates.map((date) => (
          <DayColumn
            key={date.toISOString()}
            date={date}
            events={events}
            constraints={constraints}
            eventBlocks={eventBlocks}
            hourHeight={hourHeight}
            dayStartHour={dayStartHour}
            hoursPerDay={hoursPerDay}
            onTimeRangeSelect={onTimeRangeSelect}
            onEventBlockClick={onEventBlockClick}
          />
        ))}
      </Box>
    </ScrollArea>
  );
};
