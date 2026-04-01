import { Modal, TextInput, Button, Stack, NumberInput, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { userRepository } from "@/modules/resources/src/data";
import resources from "./activity-editor.resources.json";

interface ActivityEditorProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: {
        activityType: string;
        assignedUserId: string;
        expectedStudents: number | null;
    }) => Promise<void>;
    readonly loading?: boolean;
    readonly initialData?: {
        readonly activityType: string;
        readonly assignedUserId: string;
        readonly expectedStudents: number | null;
    };
}

export function ActivityEditor({
    opened,
    onClose,
    onSubmit,
    loading = false,
    initialData,
}: ActivityEditorProps) {
    const [activityType, setActivityType] = useState("");
    const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
    const [expectedStudents, setExpectedStudents] = useState<number | null>(null);
    const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Fetch users when modal opens
    useEffect(() => {
        if (opened) {
            fetchUsers();
        }
    }, [opened]);

    useEffect(() => {
        if (initialData) {
            setActivityType(initialData.activityType);
            // Check if assigned user is empty or unassigned, if so set to null
            const isUnassigned = !initialData.assignedUserId || 
                initialData.assignedUserId.trim().length === 0;
            setAssignedUserId(isUnassigned ? null : initialData.assignedUserId);
            setExpectedStudents(initialData.expectedStudents);
        }
    }, [initialData]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const userList = await userRepository.getAll();
            const options = userList.map((user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`,
            }));
            setUsers(options);
            $app.logger.info(`[ActivityEditor] ${resources.logger.fetchedUsers}`, { count: userList.length });
        } catch (error) {
            $app.logger.error(`[ActivityEditor] ${resources.logger.errorFetchingUsers}`, error);
            $app.notifications.showError(
                resources.notifications.loadUsersError.title,
                resources.notifications.loadUsersError.message,
            );
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleSubmit = async () => {
        $app.logger.info(`[ActivityEditor] ${resources.logger.handleSubmitCalled}`, {
            activityType,
            assignedUserId,
            expectedStudents,
        });

        if (!activityType.trim()) {
            $app.logger.warn(`[ActivityEditor] ${resources.logger.validationFailed}`);
            return;
        }

        $app.logger.info(`[ActivityEditor] ${resources.logger.callingOnSubmit}`);
        await onSubmit({
            activityType,
            assignedUserId: assignedUserId || "",
            expectedStudents,
        });

        $app.logger.info(`[ActivityEditor] ${resources.logger.onSubmitCompleted}`);
        setActivityType("");
        setAssignedUserId(null);
        setExpectedStudents(null);
    };

    const handleClose = () => {
        setActivityType("");
        setAssignedUserId(null);
        setExpectedStudents(null);
        onClose();
    };

    return (
        <Modal opened={opened} onClose={handleClose} title={resources.modalTitle} centered>
            <Stack>
                <TextInput
                    label={resources.activityTypeLabel}
                    placeholder={resources.activityTypePlaceholder}
                    value={activityType}
                    onChange={(e) => setActivityType(e.currentTarget.value)}
                    required
                />
                <Select
                    label={resources.assignedUserLabel}
                    placeholder={resources.assignedUserPlaceholder}
                    data={users}
                    value={assignedUserId}
                    onChange={setAssignedUserId}
                    disabled={isLoadingUsers}
                    searchable
                    clearable
                />
                <NumberInput
                    label={resources.expectedStudentsLabel}
                    placeholder={resources.expectedStudentsPlaceholder}
                    value={expectedStudents ?? undefined}
                    onChange={(value) => setExpectedStudents(value === "" ? null : Number(value))}
                    min={0}
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!activityType.trim() || isLoadingUsers}
                    fullWidth
                >
                    {resources.submitButton}
                </Button>
            </Stack>
        </Modal>
    );
}
