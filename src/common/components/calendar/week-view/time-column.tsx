/** @author noamarg */
import React from 'react';
import { Box, Text } from '@mantine/core';

import styles from './time-column.module.css';

interface TimeColumnProps {
  hourHeight?: number;
  dayStartHour?: number;
  hoursPerDay?: number;
}

export const TimeColumn: React.FC<TimeColumnProps> = ({
  hourHeight = 60,
  dayStartHour = 0,
  hoursPerDay = 24
}) => {
  const formatHourLabel = (hour: number) => {
    const normalizedHour = ((hour % 24) + 24) % 24;
    return `${normalizedHour.toString().padStart(2, '0')}:00`;
  };

  const times = Array.from({ length: hoursPerDay + 1 }).map((_, i) => {
    const hour = i + dayStartHour;
    const displayHour = formatHourLabel(hour);

    return (
      <Box
        key={`time-${hour}`}
        className={styles.timeSlot}
        style={{
          height: i === hoursPerDay ? 0 : `${hourHeight}px`
        }}
      >
        <Text size="xs" c="dimmed" className={styles.timeLabel}>
          {displayHour}
        </Text>
      </Box>
    );
  });

  return (
    <Box className={styles.timeColumn}>
      {times}
    </Box>
  );
};
