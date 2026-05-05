import { useEffect, useState } from "react";
import { Modal, Select, Button, Group, Loader, Text, Stack } from "@mantine/core";
import { schedulingPeriodRepository } from "@/modules/agent/src/data/external";
import type { SchedulingPeriod } from "@/modules/agent/src/data/external";

interface SchedulingPeriodModalProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (schedulingPeriodId: string) => void;
    readonly loading?: boolean;
    readonly labels: {
        title: string;
        selectLabel: string;
        selectPlaceholder: string;
        confirm: string;
        cancel: string;
    };
}

export function SchedulingPeriodModal({
    opened,
    onClose,
    onConfirm,
    loading = false,
    labels,
}: SchedulingPeriodModalProps) {
    const [periods, setPeriods] = useState<SchedulingPeriod[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!opened) return;

        setIsFetching(true);
        setSelectedId(null);

        schedulingPeriodRepository
            .getAll()
            .then(setPeriods)
            .catch((err) => {
                $app.logger.error("[SchedulingPeriodModal] Error fetching periods", err);
                $app.notifications.showError("Failed to load scheduling periods");
            })
            .finally(() => setIsFetching(false));
    }, [opened]);

    const periodOptions = periods.map((p) => ({
        value: p.id,
        label: p.name,
    }));

    const handleConfirm = () => {
        if (selectedId) {
            onConfirm(selectedId);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={labels.title}
            centered
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
        >
            {isFetching ? (
                <Stack align="center" py="lg">
                    <Loader size="sm" />
                </Stack>
            ) : periods.length === 0 ? (
                <Text c="dimmed" ta="center" py="lg">
                    No scheduling periods available.
                </Text>
            ) : (
                <Select
                    label={labels.selectLabel}
                    placeholder={labels.selectPlaceholder}
                    data={periodOptions}
                    searchable
                    value={selectedId}
                    onChange={setSelectedId}
                    mb="lg"
                />
            )}

            <Group justify="flex-end" gap="sm">
                <Button variant="subtle" onClick={onClose} disabled={loading}>
                    {labels.cancel}
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={!selectedId}
                    loading={loading}
                >
                    {labels.confirm}
                </Button>
            </Group>
        </Modal>
    );
}
