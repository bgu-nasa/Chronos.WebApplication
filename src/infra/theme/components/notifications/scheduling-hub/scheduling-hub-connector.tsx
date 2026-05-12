import { useEffect } from "react";
import { $app } from "@/infra/service/app";
import { connectSchedulingHubForSession } from "./use-scheduling-hub-connection";

/**
 * Renders nothing. Mounts the scheduling → notification pipeline when the user is
 * authenticated (same lifetime as the root notification provider).
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
