import { Modal, TextInput, Button, Stack, NumberInput, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { userRepository } from "@/modules/resources/src/data";

interface ActivityCreatorProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: {
        activityType: string;
        assignedUserId: string;
        expectedStudents: number | null;
        duration: number;
    }) => Promise<void>;
    loading?: boolean;
}

export function ActivityCreator({
    opened,
    onClose,
    onSubmit,
    loading = false,
}: ActivityCreatorProps) {
    const [activityType, setActivityType] = useState("");
    const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
    const [expectedStudents, setExpectedStudents] = useState<number | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [durationTouched, setDurationTouched] = useState(false);
    const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Fetch users when modal opens
    useEffect(() => {
        if (opened) {
            fetchUsers();
        }
    }, [opened]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const userList = await userRepository.getAll();
            const options = userList.map((user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`,
            }));
            setUsers(options);
            $app.logger.info("[ActivityCreator] Fetched users", { count: userList.length });
        } catch (error) {
            $app.logger.error("[ActivityCreator] Error fetching users:", error);
            $app.notifications.showError("Error", "Failed to load users");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleSubmit = async () => {
        $app.logger.info("[ActivityCreator] handleSubmit called", {
            activityType,
            assignedUserId,
            expectedStudents,
            duration,
        });

        setDurationTouched(true);

        if (!activityType.trim()) {
            $app.logger.warn("[ActivityCreator] Validation failed - empty activity type");
            return;
        }

        if (duration <= 0) {
            $app.notifications.showWarning("Validation", "Duration must be greater than 0");
            return;
        }

        $app.logger.info("[ActivityCreator] Calling onSubmit...");
        await onSubmit({
            activityType,
            assignedUserId: assignedUserId || "",
            expectedStudents,
            duration,
        });

        $app.logger.info("[ActivityCreator] onSubmit completed, resetting form");
        setActivityType("");
        setAssignedUserId(null);
        setExpectedStudents(null);
        setDuration(0);
        setDurationTouched(false);
    };

    const handleClose = () => {
        setActivityType("");
        setAssignedUserId(null);
        setExpectedStudents(null);
        setDuration(0);
        setDurationTouched(false);
        onClose();
    };

    return (
        <Modal opened={opened} onClose={handleClose} title="Create Group" centered>
            <Stack>
                <TextInput
                    label="Activity Type"
                    placeholder="e.g. Lecture, Practice, Lab"
                    value={activityType}
                    onChange={(e) => setActivityType(e.currentTarget.value)}
                    required
                />
                <Select
                    label="Assigned User (Optional)"
                    placeholder="Select user or leave unassigned"
                    data={users}
                    value={assignedUserId}
                    onChange={setAssignedUserId}
                    disabled={isLoadingUsers}
                    searchable
                    clearable
                />
                <NumberInput
                    label="Expected Students"
                    placeholder="Number of students"
                    value={expectedStudents ?? undefined}
                    onChange={(value) => setExpectedStudents(value === "" ? null : Number(value))}
                    min={0}
                />
                <NumberInput
                    label="Duration"
                    placeholder="Duration in hours"
                    value={duration}
                    onChange={(value) => setDuration(value === "" ? 0 : Number(value))}
                    onBlur={() => setDurationTouched(true)}
                    min={0}
                    required
                    error={durationTouched && duration <= 0 ? "Duration must be greater than 0" : undefined}
                />
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!activityType.trim() || isLoadingUsers || duration <= 0}
                    fullWidth
                >
                    Create Group
                </Button>
            </Stack>
        </Modal>
    );
}
