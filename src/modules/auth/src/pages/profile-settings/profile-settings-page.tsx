import { useState } from "react";
import {
    Container,
    Title,
    Divider,
    Button,
    Stack,
    Paper,
    Text,
} from "@mantine/core";
import { LanguageSwitcher } from "@/infra/theme/components/language-switcher";
import { ProfileUpdateForm } from "./components/profile-update-form";
import { UpdatePasswordModal } from "./components/update-password-modal";
import resourcesJson from "./profile-settings-page.resources.json";
import styles from "./profile-settings-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/auth/src/pages/profile-settings/profile-settings-page.resources.json", resourcesJson);

export function ProfileSettingsPage() {
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <Container size="md" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Text c="dimmed" mt="xs">
                    {resources.description}
                </Text>
                <Divider className={styles.divider} />

                <Stack gap="lg">
                    {/* Profile Information Section */}
                    <div>
                        <Title order={2} size="h3" mb="md">
                            {resources.sections.profileInfo}
                        </Title>
                        <ProfileUpdateForm />
                    </div>

                    {/* Language Section */}
                    <div>
                        <Title order={2} size="h3" mb="md">
                            {resources.sections.language}
                        </Title>
                        <Text size="sm" c="dimmed" mb="md">
                            {resources.language.description}
                        </Text>
                        <LanguageSwitcher variant="settings" />
                    </div>

                    {/* Danger Zone Section */}
                    <div>
                        <Title order={2} size="h3" mb="md" c="red">
                            {resources.sections.dangerZone}
                        </Title>
                        <Paper
                            p="md"
                            withBorder
                            style={{
                                borderColor: "var(--mantine-color-red-6)",
                            }}
                        >
                            <Stack gap="md">
                                <div>
                                    <Text fw={500} mb="xs">
                                        {resources.dangerZone.passwordTitle}
                                    </Text>
                                    <Text size="sm" c="dimmed" mb="md">
                                        {
                                            resources.dangerZone
                                                .passwordDescription
                                        }
                                    </Text>
                                    <Button
                                        color="red"
                                        variant="outline"
                                        onClick={() =>
                                            setPasswordModalOpen(true)
                                        }
                                    >
                                        {resources.dangerZone.passwordButton}
                                    </Button>
                                </div>
                            </Stack>
                        </Paper>
                    </div>
                </Stack>
            </div>

            {/* Update Password Modal */}
            <UpdatePasswordModal
                opened={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </Container>
    );
}
