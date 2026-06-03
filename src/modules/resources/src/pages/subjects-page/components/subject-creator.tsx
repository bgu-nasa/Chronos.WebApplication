import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { schedulingPeriodRepository } from "@/modules/resources/src/data";
import resourcesJson from "./subject-creator.resources.json";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);

const resources = translatedResources(
    "src/modules/resources/src/pages/subjects-page/components/subject-creator.resources.json",
    resourcesJson,
);
interface SubjectCreatorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { code: string; name: string; schedulingPeriodId: string }) => Promise<void>;
    loading?: boolean;
}

export function SubjectCreator({
    opened,
    onClose,
    onSubmit,
    loading = false,
}: SubjectCreatorProps) {
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

    const fetchSchedulingPeriods = async () => {
        setIsLoadingPeriods(true);
        try {
            const periods = await schedulingPeriodRepository.getAll();
            const options = periods.map((period) => ({
                value: period.id,
                label: period.name,
            }));
            setSchedulingPeriods(options);
            $app.logger.info(resources.logger.fetchedSchedulingPeriods, { count: options.length });
        } catch (error) {
            $app.logger.error(resources.logger.errorFetchingSchedulingPeriods, error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.loadSchedulingPeriodsFailed
            );
        } finally {
            setIsLoadingPeriods(false);
        }
    };

    const handleSubmit = async () => {
        $app.logger.info(resources.logger.handleSubmitCalled, { code, name, schedulingPeriodId });
        
        if (!code.trim() || !name.trim() || !schedulingPeriodId) {
            $app.logger.warn(resources.logger.validationFailed);
            return;
        }
        
        $app.logger.info(resources.logger.callingOnSubmit);
        await onSubmit({ code, name, schedulingPeriodId });
        
        $app.logger.info(resources.logger.onSubmitCompleted);
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
