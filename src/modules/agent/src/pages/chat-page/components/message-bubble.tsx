import { Paper, Text, Group } from "@mantine/core";
import styles from "./message-bubble.module.css";

interface MessageBubbleProps {
    readonly role: "user" | "agent";
    readonly content: string;
    readonly timestamp: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
    const isUser = role === "user";

    return (
        <div className={isUser ? styles.userRow : styles.agentRow}>
            <Paper
                className={styles.bubble}
                p="sm"
                radius="md"
                withBorder={!isUser}
                bg={isUser ? "var(--mantine-primary-color-light)" : undefined}
            >
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {content}
                </Text>
                <Group justify="flex-end" mt={4}>
                    <Text size="xs" c="dimmed">
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </Group>
            </Paper>
        </div>
    );
}
