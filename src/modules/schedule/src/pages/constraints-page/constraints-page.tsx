import { useEffect, useState } from "react";
import { Container, Divider, Title, Tabs } from "@mantine/core";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/schedule/src/pages/constraints-page/constraints-page.resources.json", resourcesJson);

import { ConfirmationDialog, useConfirmation } from "@/common";
import { $app } from "@/infra/service";

import {
    UserConstraintsPanel,
    ActivityConstraintsPanel,
    OrganizationPoliciesPanel
} from "./components";
import resourcesJson from "./constraints-page.resources.json";
import styles from "./constraints-page.module.css";

export function ConstraintsPage() {
    const [activeTab, setActiveTab] = useState<string | null>(resources.other.defaultActiveTab);
    const [isAdmin, setIsAdmin] = useState(false);

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    useEffect(() => {
        const userIsAdmin = $app.organization.isAdministrator();
        setIsAdmin(userIsAdmin);
    }, []);

    return (
        <Container size={resources.other.containerSize} className={styles.pageContainer}>
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    className={styles.tabsContainer}
                >
                    <Tabs.List>
                        <Tabs.Tab value={resources.tabs.user.value}>
                            {resources.tabs.user.label}
                        </Tabs.Tab>
                        {isAdmin && (
                            <>
                                <Tabs.Tab value={resources.tabs.activity.value}>
                                    {resources.tabs.activity.label}
                                </Tabs.Tab>
                                <Tabs.Tab value={resources.tabs.organization.value}>
                                    {resources.tabs.organization.label}
                                </Tabs.Tab>
                            </>
                        )}
                    </Tabs.List>

                    <Tabs.Panel value={resources.tabs.user.value} className={styles.tabPanel}>
                        {activeTab === resources.tabs.user.value && (
                            <UserConstraintsPanel
                                isAdmin={isAdmin}
                                openConfirmation={openConfirmation}
                            />
                        )}
                    </Tabs.Panel>

                    {isAdmin && (
                        <>
                            <Tabs.Panel value={resources.tabs.activity.value} className={styles.tabPanel}>
                                {activeTab === resources.tabs.activity.value && (
                                    <ActivityConstraintsPanel
                                        openConfirmation={openConfirmation}
                                    />
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value={resources.tabs.organization.value} className={styles.tabPanel}>
                                {activeTab === resources.tabs.organization.value && (
                                    <OrganizationPoliciesPanel
                                        openConfirmation={openConfirmation}
                                    />
                                )}
                            </Tabs.Panel>
                        </>
                    )}
                </Tabs>

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={resources.deleteConfirmButton}
                    cancelText={resources.deleteCancelButton}
                    loading={isConfirming}
                />
            </div>
        </Container>
    );
}
