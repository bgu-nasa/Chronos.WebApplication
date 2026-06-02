import type { ModuleConfig } from "@/infra";
import React from "react";
import {
    ManagementIcon,
    DepartmentsIcon,
    AccessControlIcon,
    SettingsIcon,
} from "@/common/icons";
import { DepartmentsPage } from "./src/pages/departments-page";
import { RolesPage, OrganizationSettingsPage } from "./src";

export const moduleConfig: ModuleConfig = {
    name: "management",
    owner: "",
    basePath: "/management",
    routes: [
        {
            authorize: true,
            name: "departments",
            path: "/departments",
            element: React.createElement(DepartmentsPage),
        },
        {
            authorize: true,
            name: "roles",
            path: "/roles",
            element: React.createElement(RolesPage),
        },
        {
            authorize: true,
            name: "organization-settings",
            path: "/organization-settings",
            element: React.createElement(OrganizationSettingsPage),
        },
    ],
    navigationItems: [
        {
            label: "Management",
            location: "dashboard",
            icon: React.createElement(ManagementIcon),
            children: [
                {
                    label: "Departments",
                    href: "/management/departments",
                    location: "dashboard",
                    requiredRoles: [
                        "Administrator",
                        "ResourceManager", // can only create
                        "Operator", // cannot interact
                    ],
                    icon: React.createElement(DepartmentsIcon),
                },
                {
                    label: "Access Control",
                    href: "/management/roles",
                    location: "dashboard",
                    requiredRoles: [
                        "Administrator",
                        "ResourceManager",
                        "Operator", // cannot interact
                    ],
                    icon: React.createElement(AccessControlIcon),
                },
                {
                    label: "Organization Settings",
                    href: "/management/organization-settings",
                    location: "dashboard",
                    requiredRoles: ["Administrator"],
                    icon: React.createElement(SettingsIcon),
                },
            ],
        },
    ],
};
