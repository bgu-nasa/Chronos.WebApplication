import { useEffect, useState } from "react";
import { Title, Text, ActionIcon, useMantineTheme } from "@mantine/core";
import styles from "./home-carousel.module.css";

type CarouselItem = { title: string; content: string };

interface HomeCarouselProps {
    items: CarouselItem[];
    intervalMs?: number;
}

export default function HomeCarousel({ items, intervalMs = 5000 }: HomeCarouselProps) {
    const [index, setIndex] = useState(0);
    const theme = useMantineTheme();

    useEffect(() => {
        if (!items || items.length === 0) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
        return () => clearInterval(id);
    }, [items, intervalMs]);

    if (!items || items.length === 0) return <div className={styles.empty}>No features available.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.slides}>
                {items.map((it, idx) => (
                    <div key={idx} className={`${styles.slide} ${idx === index ? styles.active : ""}`}>
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
                        aria-label={`Go to slide ${idx + 1}`}
                        size="sm"
                        radius="xl"
                        className={styles.dot}
                    />
                ))}
            </div>
        </div>
    );
}
