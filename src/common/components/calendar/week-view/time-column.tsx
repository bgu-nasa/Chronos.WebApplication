/** @author noamarg */
import React from 'react';
import { Box, Text } from '@mantine/core';

import { translatedResources } from "@/infra/i18n";
import styles from './time-column.module.css';
import resourcesJson from './time-column.resources.json';

const resources = translatedResources(
    "src/common/components/calendar/week-view/time-column.resources.json",
    resourcesJson,
);

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

    // Simple 12-hour format logic
    const h = hour % 24;
    if (h === 0) displayHour = resources.labels.midnight;
    else if (h < 12) displayHour = `${h} ${resources.labels.am}`;
    else if (h === 12) displayHour = resources.labels.noon;
    else displayHour = `${h - 12} ${resources.labels.pm}`;

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
