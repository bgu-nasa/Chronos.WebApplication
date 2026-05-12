import * as signalR from "@microsoft/signalr";
import { tokenService } from "@/infra/service/ajax/token.service";

export interface SchedulingCompletedPayload {
    requestId: string;
    success: boolean;
    assignmentsCreated: number;
    assignmentsModified: number;
    unscheduledActivityIds: string[];
    failureReason: string | null;
}

function getApiBase(): string {
    return (
        window.__ENV__?.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000/"
    );
}

export function startSchedulingHub(
    onCompleted: (payload: SchedulingCompletedPayload) => void,
): signalR.HubConnection {
    const base = getApiBase().replace(/\/$/, "");
    const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${base}/hubs/scheduling`, {
            accessTokenFactory: () => tokenService.getToken() ?? "",
        })
        .withAutomaticReconnect()
        .build();

    conn.on("SchedulingCompleted", onCompleted);
    void conn.start().catch((err) => {
        console.error("[scheduling hub]", err);
    });
    return conn;
}
