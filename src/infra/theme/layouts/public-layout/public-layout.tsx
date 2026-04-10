/** @author aaron-iz */
import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    NavLink,
    Group,
} from "@mantine/core";
import { Outlet } from "react-router";
import styles from "./public-layout.module.css";
import PublicLayoutSpecialAction from "./special-action";
import { LanguageSwitcher } from "@/infra/theme/components/language-switcher";
import { ThemeToggleButton } from "@/infra/theme/components/theme-toggle-button";
import { ApplicationNavigationRepository as NavItemsRepo } from "@/infra/federation";
import { ChronosLogo } from "@/common";

const propStyles = {
    headerConfig: {
        height: 60,
        padding: "xs",
    },
    navLinkStyle: {
        miw: 100,
        w: "fit-content",
    },
};

export default function PublicLayout() {
    const publicNavItems = NavItemsRepo.getPublicNavigationItems();

    const getNavigationKey = (label: string) =>
        `pni-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
        <AppShell header={propStyles.headerConfig}>
            <AppShellHeader>
                <div className={styles.publicLayoutHeaderStack}>
                    <ChronosLogo height={40} />

                    <div className={styles.publicLayoutNavigationContainer}>
                        {publicNavItems.map((item) => (
                            <NavLink
                                key={getNavigationKey(item.label)}
                                href={item.href}
                                label={item.label}
                                leftSection={item.icon}
                                {...propStyles.navLinkStyle}
                            />
                        ))}

                        <Group gap="sm">
                            <LanguageSwitcher variant="compact" />
                            <ThemeToggleButton />
                            <PublicLayoutSpecialAction />
                        </Group>
                    </div>
                </div>
            </AppShellHeader>

            <AppShellMain className={styles.publicLayoutMain}>
                <Outlet />
            </AppShellMain>
        </AppShell>
    );
}
