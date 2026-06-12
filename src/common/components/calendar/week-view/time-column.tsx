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

  const times = Array.from({ length: hoursPerDay + 1 }).map((_, i) => {
    const hour = i + dayStartHour;
    let displayHour;

    // Military (24‑hour) format HH:00
    const hour24 = hour % 24;
    const paddedHour = hour24.toString().padStart(2, "0");
    displayHour = `${paddedHour}:00`;

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
