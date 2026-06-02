import type { ModuleConfig } from "@/infra";
import React from "react";
import { ResourcesPage, SubjectsPage, ActivitiesPage } from "./src/pages";
import { ResourcesIcon, CoursesIcon, ResourceManagementIcon } from "@/common/icons";

export const moduleConfig: ModuleConfig = {
    name: "Rooms",
    owner: "",
    basePath: "/resources",
    routes: [
        {
            authorize: true,
            name: "subjects",
            path: "/subjects",
            element: React.createElement(SubjectsPage),
        },
        {
            authorize: true,
            name: "activities",
            path: "/activities",
            element: React.createElement(ActivitiesPage),
        },
        {
            authorize: true,
            name: "resources",
            path: "/manage",
            element: React.createElement(ResourcesPage),
        },
    ],
    navigationItems: [
        {
            label: "Resources",
            location: "dashboard",
            icon: React.createElement(ResourcesIcon),
            children: [
                {
                    label: "Courses",
                    href: "/resources/subjects",
                    location: "dashboard",
                    requiredRoles: ["Administrator", "Viewer", "ResourceManager"],
                    icon: React.createElement(CoursesIcon),
                },
                {
                    label: "Rooms",
                    href: "/resources/manage",
                    location: "dashboard",
                    requiredRoles: ["Administrator", "Viewer", "ResourceManager"],
                    icon: React.createElement(ResourceManagementIcon),
                },
            ],
        },
    ],
};
