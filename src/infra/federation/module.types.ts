/** @author aaron-iz */
import type { JSX } from "react";

/**
 * Role types for navigation item access control
 * @dashboard-only Used only for dashboard navigation items
 */
export type RoleType =
    | "Administrator"
    | "UserManager"
    | "ResourceManager"
    | "Operator"
    | "Viewer";

/**
 * Configuration for a module in the federation
 */
export type ModuleConfig = {
    /**
     * The name of the module
     */
    name: string;
    /**
     * The module owner email `@bgu.ac.il`
     */
    owner: string;
    /**
     * The base path for the module's routes, will be prefixed to all routes
     */
    basePath: string;
    /**
     * The module's song
     */
    song?: string;
    /**
     * The routes provided by the module
     */
    routes: ModuleRouteConfiguration[];
    /**
     * The navigation items provided by the module
     */
    navigationItems: NavigationItem[];
};

/**
 * Configuration for a single route within a module
 */
export type ModuleRouteConfiguration = {
    /**
     * The unique name of the route
     */
    name: string;
    /**
     * The path of the route relative to the module's base path
     */
    path: string;
    /**
     * Whether the route requires authorization
     * Defaults to false
     */
    authorize?: boolean;
    /**
     * The React element to render for the route. (use React.createElement)
     */
    element: JSX.Element;
};

/**
 * A navigation item for the application's navigation menu
 */
export type NavigationItem = {
    /**
     * The label of the navigation item
     */
    label: string;
    /**
     * The href of the navigation item
     */
    href?: string;
    /**
     * The location of the navigation item in the application
     */
    location: "dashboard" | "public" | "admin";
    /**
     * The icon of the navigation item
     */
    icon?: JSX.Element;
    /**
     * The children navigation items
     */
    children?: NavigationItem[];
    /**
     * So you could define the order of the navigation items
     */
    order?: number;
    /**
     * Optional list of roles required to view this navigation item.
     * Only applicable for dashboard navigation items.
     * If specified, the user must have at least one of these roles to see this item.
     * If not specified or empty, the item is visible to all users regardless of their roles.
     * @dashboard-only This field is only enforced for items with location="dashboard"
     */
    requiredRoles?: RoleType[];
};
