import { useState } from "react";
import {
    Container,
    Title,
    Divider,
    Button,
    Stack,
    Paper,
    Text,
    Group,
    Badge,
} from "@mantine/core";
import { ConfirmationDialog } from "@/common/components/confirmation-dialog";
import { organizationDataRepository } from "@/modules/management/src/data/organization-data-repository";
import resourcesJson from "./organization-settings-page.resources.json";
import styles from "./organization-settings-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/management/src/pages/organization-settings-page/organization-settings-page.resources.json", resourcesJson);

export function OrganizationSettingsPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get organization info from global app state
    const organization = $app.organization.getOrganization();

    if (!organization) {
        return (
            <Container size="md" py="xl">
                <Text c="dimmed">{resources.noOrganization}</Text>
            </Container>
        );
    }

    const handleDelete = async () => {
        try {
            setLoading(true);
            await organizationDataRepository.deleteOrganization();

            // Refresh organization info to get updated state
            await $app.organization.fetchOrganization();

            $app.notifications.showSuccess(
                resources.deleteSuccess.title,
                resources.deleteSuccess.message,
            );
            setDeleteDialogOpen(false);
        } catch (error) {
            $app.notifications.showError(
                resources.deleteError.title,
                resources.deleteError.message,
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            setLoading(true);
            await organizationDataRepository.restoreOrganization();

            // Refresh organization info to get updated state
            await $app.organization.fetchOrganization();

            $app.notifications.showSuccess(
                resources.restoreSuccess.title,
                resources.restoreSuccess.message,
            );
            setRestoreDialogOpen(false);
        } catch (error) {
            $app.notifications.showError(
                resources.restoreError.title,
                resources.restoreError.message,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Text c="dimmed" mt="xs">
                    {resources.description}
                </Text>
                <Divider className={styles.divider} />

                {/* Organization Information Section */}
                <Stack gap="lg">
                    <div>
                        <Title order={2} size="h3" mb="md">
                            {resources.sections.organizationInfo}
                        </Title>
                        <Paper p="md" withBorder>
                            <Stack gap="md">
                                <div>
                                    <Text size="sm" c="dimmed">
                                        {resources.fields.organizationName}
                                    </Text>
                                    <Group gap="sm" mt="xs">
                                        <Text fw={500}>
                                            {organization.name}
                                        </Text>
                                        {organization.deleted && (
                                            <Badge color="red" variant="filled">
                                                {resources.fields.deletedBadge}
                                            </Badge>
                                        )}
                                    </Group>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">
                                        {resources.fields.currentUser}
                                    </Text>
                                    <Text fw={500} mt="xs">
                                        {organization.userFullName}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {organization.userEmail}
                                    </Text>
                                </div>
                            </Stack>
                        </Paper>
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
                                {!organization.deleted ? (
                                    <div>
                                        <Text fw={500} mb="xs">
                                            {resources.dangerZone.deleteTitle}
                                        </Text>
                                        <Text size="sm" c="dimmed" mb="md">
                                            {
                                                resources.dangerZone
                                                    .deleteDescription
                                            }
                                        </Text>
                                        <Button
                                            color="red"
                                            variant="outline"
                                            onClick={() =>
                                                setDeleteDialogOpen(true)
                                            }
                                        >
                                            {resources.dangerZone.deleteButton}
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Text fw={500} mb="xs">
                                            {resources.dangerZone.restoreTitle}
                                        </Text>
                                        <Text size="sm" c="dimmed" mb="md">
                                            {
                                                resources.dangerZone
                                                    .restoreDescription
                                            }
                                        </Text>
                                        <Button
                                            color="green"
                                            variant="outline"
                                            onClick={() =>
                                                setRestoreDialogOpen(true)
                                            }
                                        >
                                            {resources.dangerZone.restoreButton}
                                        </Button>
                                    </div>
                                )}
                            </Stack>
                        </Paper>
                    </div>
                </Stack>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                opened={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title={resources.deleteDialog.title}
                message={resources.deleteDialog.message}
                confirmText={resources.deleteDialog.confirmButton}
                cancelText={resources.deleteDialog.cancelButton}
                confirmColor="red"
                loading={loading}
            />

            {/* Restore Confirmation Dialog */}
            <ConfirmationDialog
                opened={restoreDialogOpen}
                onClose={() => setRestoreDialogOpen(false)}
                onConfirm={handleRestore}
                title={resources.restoreDialog.title}
                message={resources.restoreDialog.message}
                confirmText={resources.restoreDialog.confirmButton}
                cancelText={resources.restoreDialog.cancelButton}
                confirmColor="green"
                loading={loading}
            />
        </Container>
    );
}
