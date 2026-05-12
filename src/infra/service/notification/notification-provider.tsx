/**
 * Notification Provider Component
 * Renders notifications at the bottom right of the screen
 */

import { NotificationList } from "./notification-list.tsx";
import { SchedulingHubConnector } from "@/infra/theme/components/notifications/scheduling-hub";

export function NotificationProvider() {
    return (
        <>
            <SchedulingHubConnector />
            <NotificationList />
        </>
    );
}
