import type { ModuleConfig } from "@/infra";
import React from "react";
import { CalendarIcon, ScheduleIcon, ConstraintsIcon, CoursesIcon, SchedulingPeriodsIcon } from "@/common/icons";
import { CalendarPage, SchedulingPeriodsPage, ConstraintsPage, AssignmentsPage, MyAssignmentsPage } from "./src";

export const moduleConfig: ModuleConfig = {
    name: "Schedule",
    owner: "adamram@post.bgu.ac.il",
    basePath: "/schedule",
    routes: [
        {
            authorize: true,
            name: "scheduling-periods",
            path: "/scheduling-periods",
            element: React.createElement(SchedulingPeriodsPage),
        },
        {
            name: "calendar",
            path: "/calendar",
            authorize: true,
            element: React.createElement(CalendarPage),
        },
        {
            name: "calendar-event",
            path: "/calendar/event/:id",
            authorize: true,
            element: React.createElement(CalendarPage),
        },
        {
            name: "constraints",
            path: "/constraints",
            authorize: true,
            element: React.createElement(ConstraintsPage),
        },
        {
            name: "assignments",
            path: "/assignments",
            authorize: true,
            element: React.createElement(AssignmentsPage),
        },
        {
            name: "my-assignments",
            path: "/my-assignments",
            authorize: true,
            element: React.createElement(MyAssignmentsPage),
        },
    ],
    navigationItems: [
        {
            label: "Schedule",
            location: "dashboard",
            icon: React.createElement(ScheduleIcon),
            children: [
                {
                    label: "Calendar",
                    href: "/schedule/calendar",
                    location: "dashboard",
                    icon: React.createElement(CalendarIcon),
                },
                {
                    label: "Semesters",
                    href: "/schedule/scheduling-periods",
                    location: "dashboard",
                    icon: React.createElement(CoursesIcon),
                    requiredRoles: [
                        "ResourceManager",
                        "Administrator"
                    ],
                },
                {
                    label: "Constraints",
                    href: "/schedule/constraints",
                    location: "dashboard",
                    icon: React.createElement(ConstraintsIcon),
                },
                {
                    label: "Manage Assignments",
                    href: "/schedule/assignments",
                    location: "dashboard",
                    icon: React.createElement(SchedulingPeriodsIcon),
                    requiredRoles: [
                        "ResourceManager",
                        "Administrator"
                    ],
                },
                {
                    label: "My Assignments",
                    href: "/schedule/my-assignments",
                    location: "dashboard",
                    icon: React.createElement(SchedulingPeriodsIcon),
                    requiredRoles: [
                        "Viewer",
                        "Operator"
                    ],
                },
            ],
        },
    ],
};
