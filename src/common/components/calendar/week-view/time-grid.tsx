/** @author noamarg */
import React, { useMemo } from 'react';
import { Box, ScrollArea } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import type { CalendarEvent } from "@/common/types";

import { TimeColumn, DayColumn } from './';
import styles from './time-grid.module.css';

interface ConstraintVisualization {
  weekday: string;
  startTime: string;
  endTime: string;
  weekNum?: number | null;
}

interface EventBlock extends ConstraintVisualization {
  weekNum?: number | null;
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
  periodFromDate?: string;
  periodToDate?: string;
  periodWeekIndex?: number | null;
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
  periodFromDate,
  periodToDate,
  periodWeekIndex = null,
  hourHeight: propHourHeight,
  dayStartHour = 0,
  hoursPerDay = 24,
  onTimeRangeSelect,
  onEventBlockClick
}) => {
  const { ref, height } = useElementSize();

  const dynamicHourHeight = useMemo(() => {
    if (height > 0) {
      // Calculate height to fit the viewport exactly
      // ScrollArea has height = container height.
      // Padding is 20px (10px top, 10px bottom).
      const calculated = Math.floor((height - 20) / hoursPerDay);
      return Math.max(30, calculated); // Fallback to a minimum height of 30px
    }
    return propHourHeight || 60;
  }, [height, hoursPerDay, propHourHeight]);

  return (
    <ScrollArea ref={ref} className={styles.scrollArea} type="auto">
      <Box className={styles.gridContent}>
        <TimeColumn
          hourHeight={dynamicHourHeight}
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
            periodFromDate={periodFromDate}
            periodToDate={periodToDate}
            periodWeekIndex={periodWeekIndex}
            hourHeight={dynamicHourHeight}
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
