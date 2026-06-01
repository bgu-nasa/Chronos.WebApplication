import { Modal, Text, useMantineTheme } from "@mantine/core";
import HomeCarousel from "./home-carousel";
import { useEffect, useState } from "react";
import resourcesJson from "./home-page.resources.json";
import styles from "./home-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/home/src/home-page/home-page.resources.json", resourcesJson);

export function HomePage() {
    const [previewNoticeOpen, setPreviewNoticeOpen] = useState(false);
    const carouselItems = resources.carousel ?? [];
    const theme = useMantineTheme();

    const primaryShade = 6;
    const primaryHex = (theme.colors as any)[theme.primaryColor]?.[primaryShade] ?? (theme.colors as any)["blue"][6];
    function hexToRgba(hex: string, alpha = 1) {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
        const bigint = parseInt(full, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const lineColor = hexToRgba(primaryHex, 0.06);
    const fillColor = hexToRgba(primaryHex, 0.02);
    const gridBackground = `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
    const homeBgStyle: React.CSSProperties = { backgroundImage: gridBackground, backgroundSize: '40px 40px', backgroundColor: fillColor };

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
            <div className={styles.homePageContainer} style={homeBgStyle}>
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
