import * as signalR from "@microsoft/signalr";
import { tokenService } from "@/infra/service/ajax/token.service";
import type { SchedulingCompletedPayload } from "./scheduling-hub.types";

function apiBaseUrl(): string {
    return (
        window.__ENV__?.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000/"
    );
}

export function createSchedulingHubConnection(
    onCompleted: (payload: SchedulingCompletedPayload) => void,
): signalR.HubConnection {
    const base = apiBaseUrl().replace(/\/$/, "");
    const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${base}/hubs/scheduling`, {
            accessTokenFactory: () => tokenService.getToken() ?? "",
        })
        .withAutomaticReconnect()
        .build();

    conn.on("SchedulingCompleted", onCompleted);
    return conn;
}
