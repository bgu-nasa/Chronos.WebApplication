import type { ModuleConfig } from "@/infra";
import React from "react";
import {
    LoginPage,
    RegisterPage,
    UsersPage,
    ProfileSettingsPage,
} from "./src/pages";
import { UsersIcon } from "@/common/icons";

export const moduleConfig: ModuleConfig = {
    name: "Auth",
    owner: "",
    basePath: "/auth",
    routes: [
        {
            name: "login",
            path: "/login", // Route will be /auth/login
            element: React.createElement(LoginPage),
        },
        {
            name: "register",
            path: "/register", // Route will be /auth/register
            element: React.createElement(RegisterPage),
        },
        {
            authorize: true,
            name: "users",
            path: "/users",
            element: React.createElement(UsersPage),
        },
        {
            authorize: true,
            name: "profile-settings",
            path: "/profile-settings",
            element: React.createElement(ProfileSettingsPage),
        },
    ],
    navigationItems: [
        {
            label: "Login",
            labelKey: "login",
            navigationModule: "auth",
            href: "/auth/login",
            location: "public",
            order: 10,
        },
        {
            label: "Users",
            labelKey: "users",
            navigationModule: "auth",
            href: "/auth/users",
            location: "dashboard",
            // Only admins and user managers can interact with the user mgmt, but the rest can see it
            requiredRoles: [
                "Administrator",
                "UserManager",
                "ResourceManager",
                "Operator",
            ],
            icon: React.createElement(UsersIcon),
        },
    ],
};
