/**
 * Notification Provider Component
 * Renders notifications at the bottom right of the screen
 */

import { NotificationPanelAnchor } from "@/infra/theme/components/notifications/panel";
import { NotificationList } from "./notification-list.tsx";

export function NotificationProvider() {
    return (
        <>
            <NotificationPanelAnchor />
            <NotificationList />
        </>
    );
}
