/** @author aaron-iz */
import { Outlet, useLocation, useNavigate } from "react-router";
import {
    AppShell,
    NavLink,
    Stack,
    Group,
    ActionIcon,
    Tooltip,
    HoverCard,
} from "@mantine/core";
import { useEffect, useMemo } from "react";
import styles from "./dashboard-layout.module.css";
import { useDashboardNavigation } from "./use-dashboard-navigation";
import { UserCard } from "@/infra/theme/components/user-card";
import { ThemeToggleButton } from "@/infra/theme/components/theme-toggle-button";
import { useOrganization } from "@/infra/service";
import type { NavigationItem } from "@/infra/federation/module.types";
import { DashboardLoadingScreen } from "./dashboard-loading-screen";
import {
    ChronosLogo,
    ChevronLeftIcon,
    ChevronRightIcon,
    MenuIcon,
} from "@/common";
import { DeletedOrganizationAlert } from "./deleted-organization-alert";
import { useNavbarStore } from "./navbar.store";
import resources from "./navbar-collapse.resources.json";
import { filterNavigationByRoles } from "./filter-navigation-by-roles";

function renderNavigationItems(
    items: NavigationItem[],
    navigate: (path: string) => void,
    currentPath: string,
    collapsed: boolean,
    openItems: Record<string, boolean>,
    toggleItem: (itemKey: string) => void,
) {
    return items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const itemKey = item.href || item.label;
        const isOpen = openItems[itemKey] ?? false;

        // For collapsed state with children, show popover on hover
        if (collapsed && hasChildren) {
            return (
                <HoverCard
                    key={item.href}
                    position="right"
                    withArrow
                    shadow="md"
                    openDelay={200}
                    closeDelay={100}
                >
                    <HoverCard.Target>
                        <div>
                            <NavLink
                                label=""
                                leftSection={item.icon}
                                active={currentPath === item.href}
                                href={item.href}
                                className={styles.collapsedNavLink}
                            />
                        </div>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Stack gap="xs">
                            {/* Show parent as first item if it has an href */}
                            {item.href && (
                                <NavLink
                                    label={item.label}
                                    leftSection={item.icon}
                                    active={currentPath === item.href}
                                    href={item.href}
                                />
                            )}
                            {/* Show children */}
                            {item.children?.map((child) => (
                                <NavLink
                                    key={child.href}
                                    label={child.label}
                                    leftSection={child.icon}
                                    active={currentPath === child.href}
                                    href={child.href}
                                />
                            ))}
                        </Stack>
                    </HoverCard.Dropdown>
                </HoverCard>
            );
        }

        // For collapsed state without children, show simple tooltip
        if (collapsed) {
            return (
                <Tooltip
                    key={item.href}
                    label={item.label}
                    position="right"
                    withArrow
                >
                    <div>
                        <NavLink
                            label=""
                            leftSection={item.icon}
                            active={currentPath === item.href}
                            href={item.href}
                            className={styles.collapsedNavLink}
                        />
                    </div>
                </Tooltip>
            );
        }

        // For expanded state, render normally with children
        return (
            <NavLink
                key={item.href}
                label={item.label}
                leftSection={item.icon}
                active={currentPath === item.href}
                href={item.href}
                opened={isOpen}
                onChange={() => toggleItem(itemKey)}
            >
                {hasChildren &&
                    item.children &&
                    renderNavigationItems(
                        item.children,
                        navigate,
                        currentPath,
                        collapsed,
                        openItems,
                        toggleItem,
                    )}
            </NavLink>
        );
    });
}

export default function DashboardLayout() {
    const navigationItems = useDashboardNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchOrganization, organization, isLoading, error } =
        useOrganization();
    const { collapsed, toggleCollapsed, openItems, toggleItem } =
        useNavbarStore();

    // Fetch organization information when the dashboard layout mounts
    useEffect(() => {
        // Only fetch if we don't already have organization data
        if (!organization) {
            fetchOrganization().catch((error) => {
                console.error(
                    "Failed to fetch organization information:",
                    error,
                );
            });
        }
    }, [fetchOrganization, organization]);

    // Filter navigation items based on user roles
    const filteredNavigationItems = useMemo(() => {
        if (!organization) {
            return navigationItems;
        }
        return filterNavigationByRoles(navigationItems, organization.userRoles);
    }, [navigationItems, organization]);

    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{
                width: collapsed ? 80 : 300,
                breakpoint: "sm",
                collapsed: { mobile: collapsed },
            }}
        >
            <AppShell.Header>
                <div className={styles.headerContainer}>
                    <Group gap="md">
                        <ActionIcon
                            variant="subtle"
                            size="lg"
                            onClick={toggleCollapsed}
                            className={styles.burgerButton}
                            aria-label={
                                collapsed
                                    ? resources.expandSidebarAriaLabel
                                    : resources.collapseSidebarAriaLabel
                            }
                        >
                            <MenuIcon size={24} />
                        </ActionIcon>
                        <div
                            style={{ flexShrink: 0, cursor: "pointer" }}
                            onClick={() => navigate("/")}
                        >
                            <ChronosLogo height={40} />
                        </div>
                    </Group>
                    <Group gap="sm">
                        <ThemeToggleButton />
                        <UserCard />
                    </Group>
                </div>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Stack gap="xs" style={{ height: "100%" }}>
                    <div style={{ flex: 1 }}>
                        <Stack gap="xs">
                            {renderNavigationItems(
                                filteredNavigationItems,
                                navigate,
                                location.pathname,
                                collapsed,
                                openItems,
                                toggleItem,
                            )}
                        </Stack>
                    </div>
                    <div className={styles.navbarToggle}>
                        <Tooltip
                            label={
                                collapsed
                                    ? resources.expandSidebar
                                    : resources.collapseSidebar
                            }
                            position="right"
                            withArrow
                        >
                            <ActionIcon
                                variant="subtle"
                                size="lg"
                                onClick={toggleCollapsed}
                                aria-label={
                                    collapsed
                                        ? resources.expandSidebarAriaLabel
                                        : resources.collapseSidebarAriaLabel
                                }
                            >
                                {collapsed ? (
                                    <ChevronRightIcon size={20} />
                                ) : (
                                    <ChevronLeftIcon size={20} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                    </div>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <DeletedOrganizationAlert />

                {isLoading && <DashboardLoadingScreen />}
                {error}
                {!isLoading && !error && <Outlet />}
            </AppShell.Main>
        </AppShell>
    );
}
