import type { ModuleConfig } from "@/infra";
import React from "react";
import { AgentChatPage } from "./src";

export const moduleConfig: ModuleConfig = {
    name: "Agent",
    owner: "",
    basePath: "/agent",
    routes: [
        {
            name: "chat",
            path: "/chat",
            authorize: true,
            element: React.createElement(AgentChatPage),
        },
    ],
    navigationItems: [],
};
