import type { ModuleConfig } from "@/infra";
import { DashboardHomePage, HomePage } from "./src";
import React from "react";
import { HomeIcon } from "@/common/icons";

export const moduleConfig: ModuleConfig = {
    name: "Home",
    owner: "aaroni@post.bgu.ac.il",
    basePath: "/",
    routes: [
        // Use two route mappings to the same page
        {
            path: "",
            name: "Home Page",
            element: React.createElement(HomePage),
        },
        {
            path: "/home",
            name: "Home Page",
            element: React.createElement(HomePage),
        },
        {
            authorize: true,
            path: "/dashboard/home",
            name: "Dashboard Home",
            element: React.createElement(DashboardHomePage),
        },
    ],
    navigationItems: [
        {
            location: "public",
            label: "Home",
            href: "/",
            order: -1,
        },
        {
            location: "dashboard",
            label: "Home",
            href: "/dashboard/home",
            icon: React.createElement(HomeIcon),
            order: 0,
        },
    ],
};
