import { createSchedulingHubConnection } from "./create-scheduling-hub-connection";
import { $app } from "@/infra/service/app";
import type { SchedulingCompletedPayload } from "./scheduling-hub.types";

function schedulingSummary(payload: SchedulingCompletedPayload): string {
    if (!payload.success) {
        return payload.failureReason ?? "Scheduling failed";
    }
    let s = `Assignments created: ${payload.assignmentsCreated}, modified: ${payload.assignmentsModified}`;
    if (payload.unscheduledActivityIds?.length) {
        s += `. Could not schedule ${payload.unscheduledActivityIds.length} activities.`;
    }
    return s;
}

/**
 * Start the scheduling SignalR connection for the current session.
 * @returns cleanup to stop the connection (for useEffect return).
 */
export function connectSchedulingHubForSession(): () => void {
    const conn = createSchedulingHubConnection((payload) => {
        const summary = schedulingSummary(payload);
        if (payload.success) {
            $app.notifications.showSuccess("Scheduling complete", summary);
        } else {
            $app.notifications.showError(
                "Scheduling failed",
                payload.failureReason ?? summary,
            );
        }
    });

    void conn.start().catch((err) => {
        console.error("[scheduling hub]", err);
    });

    return () => {
        void conn.stop();
    };
}

