/** @author noamarg */
import React from 'react';
import { Box, Text } from '@mantine/core';

import styles from './event-block-item.module.css';

interface EventBlock {
    weekday?: string;
    startTime: string;
    endTime: string;
    activityId?: string;
    activityType?: string;
    subjectName?: string;
    assignmentId?: string;
    slotId?: string;
    resourceId?: string;
}

interface EventBlockItemProps {
    startTime: string;
    endTime: string;
    hourHeight: number;
    dayStartHour: number;
    eventBlock?: EventBlock;
    onClick?: () => void;
}

export const EventBlockItem: React.FC<EventBlockItemProps> = ({
    startTime,
    endTime,
    hourHeight,
    dayStartHour,
    eventBlock,
    onClick,
}) => {
    // Parse time strings (HH:mm) to hours
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startHour = startHours + startMinutes / 60;
    const endHour = endHours + endMinutes / 60;

    const top = (startHour - dayStartHour) * hourHeight;
    const height = (endHour - startHour) * hourHeight;

    // Generate display text
    const displayText = eventBlock?.subjectName 
        ? `${eventBlock.activityType || 'Event'} - ${eventBlock.subjectName}`
        : `${startTime} - ${endTime}`;

    const minHeightForText = 30; // Minimum height to show text

    return (
        <Box
            className={styles.eventBlockItem}
            style={{
                top: `${top}px`,
                height: `${height}px`,
            }}
            title={`${displayText}: ${startTime} - ${endTime}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            {height >= minHeightForText && (
                <Text size="xs" fw={600} className={styles.eventBlockText} truncate>
                    {displayText}
                </Text>
            )}
        </Box>
    );
};
