/** @author noamarg */
import React, { useMemo } from 'react';
import { Box, Text, Popover, Stack, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router';
import type { CalendarEvent } from "@/common/types";
import { getWeekdayLabelFromDate } from "@/common/weekdays";
import { getIntlLocale } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";

import styles from './event-item.module.css';

interface EventItemProps {
  event: CalendarEvent;
  hourHeight: number;
  dayStartHour: number;
  left?: number;
  width?: number;
}

export const EventItem: React.FC<EventItemProps> = ({
  event,
  hourHeight,
  dayStartHour,
  left = 0,
  width = 100
}) => {
  const language = useLocaleStore((state) => state.language);
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  const dateLabel = useMemo(() => {
    const locale = getIntlLocale(language);
    const weekday = getWeekdayLabelFromDate(event.start, "long");
    const rest = event.start.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
    });
    return `${weekday}, ${rest}`;
  }, [event.start, language]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/calendar/event/${event.id}`);
  };

  const startHour = event.start.getHours() + event.start.getMinutes() / 60;
  const endHour = event.end.getHours() + event.end.getMinutes() / 60;

  const top = (startHour - dayStartHour) * hourHeight;
  const height = (endHour - startHour) * hourHeight;

  const timeString = useMemo(() => {
    return `${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [event.start, event.end]);

  return (
    <Popover
      width={300}
      position="right-start"
      withArrow
      shadow="md"
      opened={opened}
    >
      <Popover.Target>
        <Box
          className={styles.eventItem}
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={handleClick}
          bg={event.color ? `${event.color}.6` : 'blue.6'}
          style={{
            top: `${top}px`,
            height: `${height}px`,
            left: `${left}%`,
            width: `${width}%`
          }}
        >
          <Text size="xs" fw={700} truncate className={styles.eventTitle}>
            {event.title}
          </Text>
        </Box>
      </Popover.Target>
      <Popover.Dropdown className={styles.popoverDropdown}>
        <Stack gap="xs" className={styles.popoverStack}>
          <Group justify="space-between">
            <Text fw={700} size="sm">{event.title}</Text>
            <Box w={12} h={12} bg={event.color ? `${event.color}.6` : 'blue.6'} style={{ borderRadius: '50%' }} />
          </Group>
          <Text size="xs" c="dimmed">
            {dateLabel}
          </Text>
          <Text size="xs" fw={500}>
            {timeString}
          </Text>
          {event.description && (
            <Text size="xs">{event.description}</Text>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
