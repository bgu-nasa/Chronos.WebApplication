import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { schedulingPeriodRepository } from "@/modules/resources/src/data";
import resources from "./subject-editor.resources.json";

interface SubjectEditorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { code: string; name: string; schedulingPeriodId: string }) => Promise<void>;
    loading?: boolean;
    initialData?: { code: string; name: string; schedulingPeriodId: string };
}

export function SubjectEditor({
    opened,
    onClose,
    onSubmit,
    loading = false,
    initialData,
}: SubjectEditorProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [schedulingPeriodId, setSchedulingPeriodId] = useState<string | null>(null);
    const [schedulingPeriods, setSchedulingPeriods] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);

    // Fetch scheduling periods when modal opens
    useEffect(() => {
        if (opened) {
            fetchSchedulingPeriods();
        }
    }, [opened]);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setName(initialData.name);
            setSchedulingPeriodId(initialData.schedulingPeriodId);
        }
    }, [initialData]);

    const fetchSchedulingPeriods = async () => {
        setIsLoadingPeriods(true);
        try {
            const periods = await schedulingPeriodRepository.getAll();
            const options = periods.map((period) => ({
                value: period.id,
                label: period.name,
            }));
            setSchedulingPeriods(options);
            $app.logger.info(`[SubjectEditor] ${resources.logger.fetchedSchedulingPeriods}`, { count: options.length });
        } catch (error) {
            $app.logger.error(`[SubjectEditor] ${resources.logger.errorFetchingSchedulingPeriods}`, error);
            $app.notifications.showError(
                resources.notifications.loadSchedulingPeriodsError.title,
                resources.notifications.loadSchedulingPeriodsError.message,
            );
        } finally {
            setIsLoadingPeriods(false);
        }
    };

    const handleSubmit = async () => {
        $app.logger.info(`[SubjectEditor] ${resources.logger.handleSubmitCalled}`, { code, name, schedulingPeriodId });
        
        if (!code.trim() || !name.trim() || !schedulingPeriodId) {
            $app.logger.warn(`[SubjectEditor] ${resources.logger.validationFailed}`);
            return;
        }
        
        $app.logger.info(`[SubjectEditor] ${resources.logger.callingOnSubmit}`);
        await onSubmit({ code, name, schedulingPeriodId });
        
        $app.logger.info(`[SubjectEditor] ${resources.logger.onSubmitCompleted}`);
        setCode("");
        setName("");
        setSchedulingPeriodId(null);
    };

    const handleClose = () => {
        setCode("");
        setName("");
        setSchedulingPeriodId(null);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={resources.modalTitle}
            centered
        >
            <Stack>
                <TextInput
                    label={resources.codeLabel}
                    placeholder={resources.codePlaceholder}
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    required
                />
                <TextInput
                    label={resources.nameLabel}
                    placeholder={resources.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                />
                <Select
                    label={resources.schedulingPeriodLabel}
                    placeholder={resources.schedulingPeriodPlaceholder}
                    data={schedulingPeriods}
                    value={schedulingPeriodId}
                    onChange={setSchedulingPeriodId}
                    disabled={isLoadingPeriods}
                    searchable
                    required
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!code.trim() || !name.trim() || !schedulingPeriodId || isLoadingPeriods}
                    fullWidth
                >
                    {resources.submitButton}
                </Button>
            </Stack>
        </Modal>
    );
}
