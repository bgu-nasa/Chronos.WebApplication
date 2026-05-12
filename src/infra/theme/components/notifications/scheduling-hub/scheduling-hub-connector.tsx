import { useSchedulingHubConnection } from "./use-scheduling-hub-connection";

/**
 * Renders nothing; mounts the scheduling SignalR subscription for authenticated layout shells.
 */
export function SchedulingHubConnector() {
    useSchedulingHubConnection();
    return null;
}
