/**
 * Bell + menu for notification history, and scheduling completion realtime (SignalR).
 * Mount in the shell header (or another authenticated chrome) for correct alignment;
 * hub/session logic stays in this module.
 */

import {
    ActionIcon,
    Indicator,
    Menu,
    ScrollArea,
    Stack,
    Text,
} from "@mantine/core";
import { FaBell } from "react-icons/fa";
import { useNotificationPanelStore } from "./notification-panel.store";
import { SchedulingHubConnector } from "../scheduling-hub";

function typeColor(type: string): string | undefined {
    switch (type) {
        case "success":
            return "green";
        case "error":
            return "red";
        case "warning":
            return "yellow";
        case "info":
            return "blue";
        default:
            return undefined;
    }
}

export function NotificationPanelMenu() {
    return (
        <>
            <SchedulingHubConnector />
            <NotificationPanelMenuContent />
        </>
    );
}

function NotificationPanelMenuContent() {
    const entries = useNotificationPanelStore((s) => s.entries);
    const removeEntry = useNotificationPanelStore((s) => s.removeEntry);
    const clearEntries = useNotificationPanelStore((s) => s.clearEntries);

    return (
        <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
                <Indicator
                    inline
                    disabled={entries.length === 0}
                    label={entries.length}
                    size={18}
                >
                    <ActionIcon
                        variant="subtle"
                        aria-label="Notifications"
                        size="lg"
                    >
                        <FaBell size={20} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                {entries.length === 0 ? (
                    <Text size="sm" c="dimmed" px="sm" py="xs">
                        No notifications yet
                    </Text>
                ) : (
                    <ScrollArea h={280}>
                        <Stack gap={4} p="xs">
                            {entries.map((entry) => (
                                <div key={entry.id}>
                                    <Text
                                        size="sm"
                                        fw={500}
                                        lineClamp={2}
                                        c={typeColor(entry.type)}
                                    >
                                        {entry.title}
                                    </Text>
                                    {entry.message ? (
                                        <Text size="sm" lineClamp={4}>
                                            {entry.message}
                                        </Text>
                                    ) : null}
                                    <Text size="xs" c="dimmed">
                                        {new Date(entry.at).toLocaleString()}
                                    </Text>
                                    <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => removeEntry(entry.id)}
                                    >
                                        Dismiss
                                    </Text>
                                </div>
                            ))}
                        </Stack>
                    </ScrollArea>
                )}
                {entries.length > 0 ? (
                    <>
                        <Menu.Divider />
                        <Menu.Item onClick={clearEntries}>
                            Clear history
                        </Menu.Item>
                    </>
                ) : null}
            </Menu.Dropdown>
        </Menu>
    );
}
