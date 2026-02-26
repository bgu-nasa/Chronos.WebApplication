/**
 * Custom logger service that collects logs in a queue and periodically
 * sends them to Discord via webhook
 */

import type {
    ILogger,
    LogEntry,
    LogLevel,
    DiscordWebhookPayload,
} from "./logger.types";

// Store reference to organization service getter
// This will be set from app.ts to avoid circular dependency
let getOrgIdCallback: (() => string | null) | null = null;

/**
 * Set the callback to get organization ID
 * Called from app.ts after initialization
 */
export function setOrganizationIdGetter(getter: () => string | null): void {
    getOrgIdCallback = getter;
}

class LoggerService implements ILogger {
    private queue: LogEntry[] = [];
    private readonly flushInterval: number = 3000; // 3 seconds
    private intervalId: number | null = null;
    private webhookUrl: string | null = null;
    private isFlushing: boolean = false;

    constructor() {
        this.webhookUrl =
            window.__ENV__?.VITE_DISCORD_WEBHOOK_URL ||
            import.meta.env.VITE_DISCORD_WEBHOOK_URL ||
            null;
        this.startFlushInterval();
    }

    /**
     * Start the periodic flush interval
     */
    private startFlushInterval(): void {
        if (this.intervalId !== null) {
            return;
        }

        this.intervalId = window.setInterval(() => {
            this.flushQueue();
        }, this.flushInterval);
    }

    /**
     * Stop the periodic flush interval
     */
    private stopFlushInterval(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Add a log entry to the queue
     */
    private addToQueue(
        level: LogLevel,
        message: string,
        ...args: unknown[]
    ): void {
        const entry: LogEntry = {
            level,
            timestamp: Date.now(),
            message,
            data: args.length > 0 ? args : undefined,
        };

        this.queue.push(entry);
    }

    /**
     * Flush the queue to Discord
     */
    private async flushQueue(): Promise<void> {
        // Don't flush if already flushing, no webhook URL, or queue is empty
        if (this.isFlushing || !this.webhookUrl || this.queue.length === 0) {
            return;
        }

        this.isFlushing = true;

        try {
            // Get all entries from the queue
            const entries = [...this.queue];
            this.queue = [];

            // Send to Discord
            await this.sendToDiscord(entries);
        } catch (error) {
            // If sending fails, put entries back in queue (at the beginning)
            this.queue.unshift(...this.queue);

            // Fallback to console in case of error
            console.error("Failed to send logs to Discord:", error);
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Get organization ID if available
     */
    private getOrganizationId(): string | null {
        try {
            return getOrgIdCallback ? getOrgIdCallback() : null;
        } catch {
            return null;
        }
    }

    /**
     * Format a single log entry as plain text
     * Format: [LEVEL][timestamp][orgid:id] msg
     */
    private formatLogEntry(entry: LogEntry, orgId: string | null): string {
        const level = entry.level.toUpperCase().padEnd(5, " ");
        const timestamp = new Date(entry.timestamp).toISOString();
        const orgIdStr = orgId ? `[orgid:${orgId}]` : "";

        let line = `[${level}][${timestamp}]${orgIdStr} ${entry.message}`;

        // Add additional data if present
        if (entry.data && entry.data.length > 0) {
            const dataStr = entry.data
                .map((d) => {
                    try {
                        return typeof d === "object"
                            ? JSON.stringify(d)
                            : String(d);
                    } catch {
                        return String(d);
                    }
                })
                .join(" | ");

            line += ` | ${dataStr}`;
        }

        return line;
    }

    /**
     * Send log entries to Discord webhook as plain text
     */
    private async sendToDiscord(entries: LogEntry[]): Promise<void> {
        if (!this.webhookUrl) {
            return;
        }

        // Get organization ID once for the batch
        const orgId = this.getOrganizationId();

        // Format all entries as plain text (each log separated with new line)
        const logLines = entries.map((entry) =>
            this.formatLogEntry(entry, orgId),
        );
        const content = logLines.join("\n");

        // Discord has a 2000 character limit for message content
        // Split into chunks if necessary
        const chunks: string[] = [];

        if (content.length <= 1900) {
            chunks.push(content);
        } else {
            // Split by lines to respect message boundaries
            let currentChunk = "";
            for (const line of logLines) {
                if ((currentChunk + line + "\n").length > 1900) {
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = line + "\n";
                } else {
                    currentChunk += line + "\n";
                }
            }
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
        }

        // Send each chunk as a separate message
        for (const chunk of chunks) {
            const payload: DiscordWebhookPayload = {
                content: `\`\`\`\n${chunk}\n\`\`\``,
            };

            const response = await fetch(this.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(
                    `Discord webhook failed: ${response.status} ${response.statusText}`,
                );
            }

            // Small delay between messages to avoid rate limiting
            if (chunks.length > 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
    }

    // Public API methods

    log(message: string, ...args: unknown[]): void {
        this.addToQueue("log", message, ...args);
    }

    info(message: string, ...args: unknown[]): void {
        this.addToQueue("info", message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.addToQueue("warn", message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this.addToQueue("error", message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        this.addToQueue("debug", message, ...args);
    }

    /**
     * Manually flush the log queue to Discord
     */
    async flush(): Promise<void> {
        await this.flushQueue();
    }

    /**
     * Cleanup method - stops the flush interval
     */
    destroy(): void {
        this.stopFlushInterval();
        // Flush any remaining logs
        this.flushQueue();
    }
}

// Export singleton instance
export const loggerService = new LoggerService();

// Cleanup on page unload
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        loggerService.destroy();
    });
}
