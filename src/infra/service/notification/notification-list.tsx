/**
 * Notification List Component
 * Renders all active notifications using Mantine Notification components
 */

import { Notification } from "@mantine/core";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNotificationStore } from "./notification.store";
import styles from "./notification-list.module.css";

export function getNotificationColor(type: string): string | undefined {
    switch (type) {
        case "success":
            return "green";
        case "error":
            return "red";
        case "warning":
            return "yellow";
        case "loading":
            return "blue";
        case "info":
            return "blue";
        default:
            return undefined;
    }
}

export function NotificationList() {
    const notifications = useNotificationStore((state) => state.notifications);

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <FaCheckCircle size={20} />;
            case "error":
                return <FaTimesCircle size={20} />;
            case "warning":
                return <FaExclamationTriangle size={20} />;
            case "loading":
                return (
                    <AiOutlineLoading3Quarters
                        size={20}
                        className={styles.spinning}
                    />
                );
            case "info":
                return <FaInfoCircle size={20} />;
            default:
                return undefined;
        }
    };

    return (
        <div className={styles.container}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    icon={notification.icon || getIcon(notification.type)}
                    color={
                        notification.color ||
                        getNotificationColor(notification.type)
                    }
                    title={notification.title}
                    onClose={() =>
                        useNotificationStore
                            .getState()
                            .removeNotification(notification.id)
                    }
                    withCloseButton={notification.withCloseButton}
                    className={styles.notification}
                >
                    {notification.message}
                </Notification>
            ))}
        </div>
    );
}
