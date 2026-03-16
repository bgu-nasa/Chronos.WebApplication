import { useEffect } from "react";
import { Select, Stack, Text } from "@mantine/core";

import { useUsers } from "@/modules/auth/src/hooks";
import resources from "../calendar-page.resources.json";

interface UserSelectProps {
    readonly value: string | null;
    readonly onChange: (value: string | null) => void;
    readonly disabled?: boolean;
}

export function UserSelect({ value, onChange, disabled = false }: UserSelectProps) {
    const { users, isLoading, fetchUsers } = useUsers();

    useEffect(() => {
        // Only fetch users if organization context is available
        const org = $app.organization.getOrganization();
        if (org) {
            void fetchUsers().catch((error) => {
                // Silently handle errors - organization might not be ready yet
                // The error will be logged by the repository
                $app.logger.debug("Failed to fetch users:", error);
            });
        }
    }, [fetchUsers]);

    const data = users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
    }));

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>
                {resources.userSelect.label}
            </Text>
            <Select
                placeholder={resources.userSelect.placeholder}
                data={data}
                value={value}
                onChange={onChange}
                disabled={isLoading || disabled}
                nothingFoundMessage={resources.userSelect.nothingFoundMessage}
                searchable={!disabled}
                clearable={!disabled}
            />
        </Stack>
    );
}
