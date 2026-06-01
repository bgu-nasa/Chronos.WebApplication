import { Modal, Text } from "@mantine/core";
import HomeCarousel from "./home-carousel";
import { useEffect, useState } from "react";
import resourcesJson from "./home-page.resources.json";
import styles from "./home-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/home/src/home-page/home-page.resources.json", resourcesJson);

export function HomePage() {
    const [previewNoticeOpen, setPreviewNoticeOpen] = useState(false);
    const carouselItems = resources.carousel ?? [];

    const handleClosePreviewNotice = () => {
        setPreviewNoticeOpen(false);
    };


    // Show the preview notice modal after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreviewNoticeOpen(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className={styles.homePageContainer}>
                <div className={styles.homePageHero}>
                    <div className={styles.homePageFeatureTabs}>
                        <HomeCarousel items={carouselItems} />
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
