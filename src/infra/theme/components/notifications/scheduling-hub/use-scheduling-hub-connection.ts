import { useEffect } from "react";
import { $app } from "@/infra/service";
import { createSchedulingHubConnection } from "./create-scheduling-hub-connection";
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
 * Subscribes to scheduling completion events and surfaces them through
 * {@link $app.notifications} (toasts + top bar history).
 */
export function useSchedulingHubConnection(): void {
    useEffect(() => {
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
    }, []);
}
