/**
 * Fixed-position bell + notification history, and scheduling hub (via NotificationPanelMenu).
 * Keeps dashboard layout free of notification UI.
 */

import { Affix } from "@mantine/core";
import { useLocation } from "react-router";
import { $app } from "@/infra/service/app";
import { NotificationPanelMenu } from "./notification-panel-menu";

export function NotificationPanelAnchor() {
    useLocation();

    if (!$app.isAuthenticated()) {
        return null;
    }

    return (
        <Affix
            position={{ top: 12, right: 12 }}
            zIndex={400}
            withinPortal={false}
        >
            <NotificationPanelMenu />
        </Affix>
    );
}
