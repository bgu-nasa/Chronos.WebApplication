import { Stack } from "@mantine/core";
import { WelcomeSection, FeatureCard, InfoSection } from "./components";
import resourcesJson from "./dashboard-home-page.resources.json";
import styles from "./dashboard-home-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/home/src/dashboard-home-page/dashboard-home-page.resources.json", resourcesJson);

export function DashboardHomePage() {
    return (
        <div className={styles.dashboardHomePageContainer}>
            <Stack gap="xl">
                <WelcomeSection
                    title={resources.welcome.title}
                    subtitle={resources.welcome.subtitle}
                />

                <div className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<span>🤖</span>}
                        title={resources.features.automated.title}
                        description={resources.features.automated.description}
                    />
                    <FeatureCard
                        icon={<span>👥</span>}
                        title={resources.features.collaborative.title}
                        description={
                            resources.features.collaborative.description
                        }
                    />
                    <FeatureCard
                        icon={<span>⚡</span>}
                        title={resources.features.flexible.title}
                        description={resources.features.flexible.description}
                    />
                    <FeatureCard
                        icon={<span>🔍</span>}
                        title={resources.features.transparent.title}
                        description={resources.features.transparent.description}
                    />
                </div>

                <div className={styles.sectionsGrid}>
                    <InfoSection
                        title={resources.problemDomain.title}
                        content={resources.problemDomain.content}
                    />
                    <InfoSection
                        title={resources.vision.title}
                        content={resources.vision.content}
                    />
                </div>
            </Stack>
        </div>
    );
}
