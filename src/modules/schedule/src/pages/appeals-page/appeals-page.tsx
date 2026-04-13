import { useEffect, useState } from "react";
import { Container, Divider, Title, Button, Group } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { appealDataRepository } from "@/modules/schedule/src/data/appeal-data-repository";
import type { AppealResponse } from "@/modules/schedule/src/data/appeal.types";
import { AppealsDataTable } from "./components/appeals-data-table";
import resources from "./appeals-page.resources.json";
import styles from "./appeals-page.module.css";

export function AppealsPage() {
    const [appeals, setAppeals] = useState<AppealResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState<AppealResponse | null>(null);

    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    const fetchAppeals = async () => {
        setIsLoading(true);
        try {
            const data = await appealDataRepository.getAllAppeals();
            setAppeals(data);
        } catch (err) {
            $app.logger.error("Failed to fetch appeals:", err);
            $app.notifications.showError("Error", "Failed to fetch appeals");
            setAppeals([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    const handleDeleteClick = () => {
        if (!selectedAppeal) return;

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage,
            onConfirm: async () => {
                try {
                    await appealDataRepository.deleteAppeal(selectedAppeal.id);
                    setSelectedAppeal(null);
                    $app.notifications.showSuccess("Success", "Appeal deleted successfully");
                    fetchAppeals();
                } catch {
                    $app.notifications.showError("Error", "Failed to delete appeal");
                }
            },
        });
    };

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <div className={styles.headerRow}>
                    <Group>
                        <Button
                            variant="light"
                            onClick={handleDeleteClick}
                            disabled={!selectedAppeal}
                        >
                            {resources.deleteButton}
                        </Button>
                    </Group>
                </div>

                <AppealsDataTable
                    appeals={appeals}
                    selectedAppeal={selectedAppeal}
                    onSelectionChange={setSelectedAppeal}
                    isLoading={isLoading}
                />

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
