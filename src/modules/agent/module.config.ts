import type { ModuleConfig } from "@/infra";
import React from "react";
import { ChatPage } from "./src";

export const moduleConfig: ModuleConfig = {
    name: "agent",
    owner: "",
    basePath: "/agent",
    routes: [
        {
            name: "chat",
            path: "/chat",
            authorize: true,
            element: React.createElement(ChatPage),
        },
    ],
    navigationItems: [],
};
