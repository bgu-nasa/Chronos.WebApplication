import { Paper } from "@mantine/core";
import styles from "./typing-indicator.module.css";
import messageBubbleStyles from "./message-bubble.module.css";

export function TypingIndicator() {
    return (
        <div className={messageBubbleStyles.agentRow}>
            <Paper
                className={messageBubbleStyles.bubble}
                p="sm"
                radius="md"
                withBorder
            >
                <div className={styles.dotsContainer}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </Paper>
        </div>
    );
}
