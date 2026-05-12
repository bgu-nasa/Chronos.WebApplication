import { useEffect } from "react";
import { $app } from "@/infra/service/app";
import { connectSchedulingHubForSession } from "./use-scheduling-hub-connection";

/**
 * Renders nothing. Mounts the scheduling → notification pipeline when the user is
 * authenticated. Colocated with the notification bell so hub lifetime matches that UI.
 */
export function SchedulingHubConnector() {
    const authed = $app.isAuthenticated();

    useEffect(() => {
        if (!authed) {
            return undefined;
        }
        return connectSchedulingHubForSession();
    }, [authed]);

    return null;
}
