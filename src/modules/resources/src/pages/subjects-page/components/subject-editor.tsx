import { Modal, TextInput, Button, Stack, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { schedulingPeriodRepository } from "@/modules/resources/src/data";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);
import resourcesJson from "../subjects-page.resources.json";

const resources = translatedResources(
    "src/modules/resources/src/pages/subjects-page/subjects-page.resources.json",
    resourcesJson,
);


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
            $app.logger.info("[SubjectEditor] Fetched scheduling periods", { count: options.length });
        } catch (error) {
            $app.logger.error("[SubjectEditor] Error fetching scheduling periods:", error);
            $app.notifications.showError(
                notificationResources.errorTitle,
                resources.notifications.loadSchedulingPeriodsFailed,
            );
        } finally {
            setIsLoadingPeriods(false);
        }
    };

    const handleSubmit = async () => {
        $app.logger.info("[SubjectEditor] handleSubmit called", { code, name, schedulingPeriodId });
        
        if (!code.trim() || !name.trim() || !schedulingPeriodId) {
            $app.logger.warn("[SubjectEditor] Validation failed - empty fields");
            return;
        }
        
        $app.logger.info("[SubjectEditor] Calling onSubmit...");
        await onSubmit({ code, name, schedulingPeriodId });
        
        $app.logger.info("[SubjectEditor] onSubmit completed, resetting form");
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
            title="Edit Course"
            centered
        >
            <Stack>
                <TextInput
                    label="Course Code"
                    placeholder="e.g. CS101"
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    required
                />
                <TextInput
                    label="Course Name"
                    placeholder="e.g. Operating Systems"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                />
                <Select
                    label="Scheduling Period"
                    placeholder="Select scheduling period"
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
                    Save Changes
                </Button>
            </Stack>
        </Modal>
    );
}
