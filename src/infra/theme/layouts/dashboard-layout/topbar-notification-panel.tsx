import {
    ActionIcon,
    Indicator,
    Menu,
    ScrollArea,
    Stack,
    Text,
} from "@mantine/core";
import { FaBell } from "react-icons/fa";
import { useSchedulingAlertsStore } from "./scheduling-alerts.store";

export function TopbarNotificationPanel() {
    const items = useSchedulingAlertsStore((s) => s.items);
    const remove = useSchedulingAlertsStore((s) => s.remove);
    const clear = useSchedulingAlertsStore((s) => s.clear);

    return (
        <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
                <Indicator
                    inline
                    disabled={items.length === 0}
                    label={items.length}
                    size={18}
                >
                    <ActionIcon
                        variant="subtle"
                        aria-label="Scheduling notifications"
                        size="lg"
                    >
                        <FaBell size={20} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Scheduling</Menu.Label>
                {items.length === 0 ? (
                    <Text size="sm" c="dimmed" px="sm" py="xs">
                        No notifications yet
                    </Text>
                ) : (
                    <ScrollArea h={280}>
                        <Stack gap={4} p="xs">
                            {items.map((item) => (
                                <div key={item.id}>
                                    <Text
                                        size="sm"
                                        c={item.success ? "green" : "red"}
                                        lineClamp={4}
                                    >
                                        {item.message}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {new Date(item.at).toLocaleString()}
                                    </Text>
                                    <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => remove(item.id)}
                                    >
                                        Dismiss
                                    </Text>
                                </div>
                            ))}
                        </Stack>
                    </ScrollArea>
                )}
                {items.length > 0 ? (
                    <>
                        <Menu.Divider />
                        <Menu.Item onClick={clear}>Clear all</Menu.Item>
                    </>
                ) : null}
            </Menu.Dropdown>
        </Menu>
    );
}
