/** @author noamarg */
import React from 'react';
import { Box, Text } from '@mantine/core';
import { getIntlLocale } from "@/infra/i18n";
import { getWeekdayLabelFromDate } from "@/common/weekdays";
import { useLocaleStore } from "@/infra/theme/state";
import styles from './week-header.module.css';

interface WeekHeaderProps {
  weekDates: Date[];
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({ weekDates }) => {
  const language = useLocaleStore((state) => state.language);
  const locale = getIntlLocale(language);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Box className={styles.weekHeaderContainer}>
      {weekDates.map((date) => {
        const isToday = date.getTime() === today.getTime();
        return (
          <Box key={date.toISOString()} className={styles.dayHeader}>
            <Text size="xs" fw={isToday ? 700 : 500} c={isToday ? 'blue' : 'dimmed'} tt="uppercase">
              {getWeekdayLabelFromDate(date, 'short')}
            </Text>
            <Text
              className={`${styles.dayNumber} ${isToday ? styles.activeDay : ''}`}
              size="lg"
              fw={isToday ? 700 : 400}
            >
              {date.toLocaleDateString(locale, { day: 'numeric' })}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
