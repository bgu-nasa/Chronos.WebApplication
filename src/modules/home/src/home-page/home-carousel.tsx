import { useEffect, useState } from "react";
import { Title, Text, ActionIcon, useMantineTheme } from "@mantine/core";
import { translatedResources } from "@/infra/i18n";
import styles from "./home-carousel.module.css";
import type { IconType } from "react-icons";
import { FiBriefcase, FiUsers, FiMessageSquare } from "react-icons/fi";
import resourcesJson from "./home-carousel.resources.json";

const resources = translatedResources(
    "src/modules/home/src/home-page/home-carousel.resources.json",
    resourcesJson,
);

type CarouselItem = { title: string; content: string };

interface HomeCarouselProps {
    items: CarouselItem[];
    intervalMs?: number;
}

export default function HomeCarousel({ items, intervalMs = 5000 }: HomeCarouselProps) {
    const [index, setIndex] = useState(0);
    const theme = useMantineTheme();

    const icons: IconType[] = [FiBriefcase, FiUsers, FiMessageSquare];
    const primaryShade = 6;
    const primaryColor = (theme.colors as any)[theme.primaryColor]?.[primaryShade] ?? (theme.colors as any)["blue"][6];

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

const backdropGradient = `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.16)}, ${hexToRgba(primaryColor, 0.06)})`;

    useEffect(() => {
        if (!items || items.length === 0) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
        return () => clearInterval(id);
    }, [items, intervalMs]);

    if (!items || items.length === 0) return <div className={styles.empty}>{resources.emptyState}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.backdrop} style={{ background: backdropGradient }} aria-hidden />

            <div className={styles.slides}>
                {items.map((it, idx) => (
                    <div key={idx} className={`${styles.slide} ${idx === index ? styles.active : ""}`}>
                        {icons[idx] ? (
                            <div className={styles.iconWrapper}>
                                {(() => {
                                    const IconComp = icons[idx];
                                    return <IconComp className={styles.icon} style={{ color: primaryColor }} aria-hidden />;
                                })()}
                            </div>
                        ) : null}

                        <Title order={3} className={styles.title}>{it.title}</Title>
                        <Text className={styles.content}>{it.content}</Text>
                    </div>
                ))}
            </div>

            <div className={styles.indicators}>
                {items.map((_, idx) => (
                    <ActionIcon
                        key={idx}
                        variant={idx === index ? "filled" : "light"}
                        color={theme.primaryColor as any}
                        onClick={() => setIndex(idx)}
                        aria-label={resources.goToSlideAriaLabel.replace(
                            "{number}",
                            String(idx + 1),
                        )}
                        size="sm"
                        radius="xl"
                        className={styles.dot}
                    />
                ))}
            </div>
        </div>
    );
}
