import { Card, Modal, Tabs, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import resourcesJson from "./home-page.resources.json";
import styles from "./home-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/home/src/home-page/home-page.resources.json", resourcesJson);

export function HomePage() {
    const [previewNoticeOpen, setPreviewNoticeOpen] = useState(false);

    const handleClosePreviewNotice = () => {
        setPreviewNoticeOpen(false);
    };

    // Show the preview notice modal after 5 seconds
    useEffect(() => {
        setTimeout(() => {
            setPreviewNoticeOpen(true);
        }, 5000);
    }, []);

    return (
        <>
            <div className={styles.homePageContainer}>
                <div className={styles.homePageHero}>
                    <Title>{resources.hero.title}</Title>
                    <Text>{resources.hero.subtitle}</Text>
                    <Text>{resources.hero.paragraph}</Text>

                    <div className={styles.homePageFeatureTabs}>
                        <Tabs
                            className={styles.homePageTabs}
                            defaultValue="overview"
                            orientation="vertical"
                        >
                            <Tabs.List>
                                {(
                                    Object.keys(resources.tabs) as Array<
                                        keyof typeof resources.tabs
                                    >
                                ).map((key) => (
                                    <Tabs.Tab key={key} value={key}>
                                        {resources.tabs[key].title}
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>

                            {(
                                Object.keys(resources.tabs) as Array<
                                    keyof typeof resources.tabs
                                >
                            ).map((key) => (
                                <Tabs.Panel key={key} value={key} p="xl">
                                    <Card shadow="xl" p="lg">
                                        {resources.tabs[key].content}
                                    </Card>
                                </Tabs.Panel>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>

            <Modal
                opened={previewNoticeOpen}
                onClose={handleClosePreviewNotice}
                title={resources.privatePreviewNotice.title}
            >
                <Text>{resources.privatePreviewNotice.paragraph}</Text>
            </Modal>
        </>
    );
}
