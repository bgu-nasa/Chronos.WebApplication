import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "@/infra/service/ajax/httpClient";
import { tokenService } from "@/infra/service/ajax/token.service";
import type { SchedulingCompletedPayload } from "./scheduling-hub.types";

const schedulingHubConnectionUrl = (): string => {
    const base = BASE_URL.replace(/\/$/, "");
    return `${base}/hubs/scheduling`;
};

export function createSchedulingHubConnection(
    onCompleted: (payload: SchedulingCompletedPayload) => void,
): signalR.HubConnection {
    const conn = new signalR.HubConnectionBuilder()
        .withUrl(schedulingHubConnectionUrl(), {
            accessTokenFactory: () => tokenService.getToken() ?? "",
        })
        .withAutomaticReconnect()
        .build();

    conn.on("SchedulingCompleted", onCompleted);
    return conn;
}
