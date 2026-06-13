/**
 * UserSelect Component
 * A Mantine Select dropdown for choosing users from the current organization
 * Shows user avatar, full name as main label, and email as secondary text
 */

import { useEffect, useState } from "react";
import { Select, Group, Avatar, Text, Stack } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { fetchUsersInOrganization } from "./fetch-users";
import type { User } from "./user.types";
import { translatedResources } from "@/infra/i18n";
import resourcesJson from "./user-select.resources.json";

const resources = translatedResources(
    "src/common/components/user-select/user-select.resources.json",
    resourcesJson,
);

interface UserSelectProps {
    value?: string | null;
    onChange?: (userId: string | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    clearable?: boolean;
}

interface UserSelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
    label: string;
    email: string;
    avatarUrl?: string | null;
    firstName: string;
    lastName: string;
}

// Custom render function for select items
function SelectItem({
    label,
    email,
    avatarUrl,
    ...others
}: UserSelectItemProps) {
    return (
        <div {...others}>
            <Group wrap="nowrap">
                <Avatar src={avatarUrl} size="sm" radius="xl" />
                <Stack gap={0}>
                    <Text size="sm">{label}</Text>
                    <Text size="xs" c="dimmed" fw={300}>
                        {email}
                    </Text>
                </Stack>
            </Group>
        </div>
    );
}

export function UserSelect({
    value,
    onChange,
    label = resources.label,
    placeholder = resources.placeholder,
    disabled = false,
    required = false,
    error,
    clearable = true,
}: UserSelectProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const data = await fetchUsersInOrganization();
                setUsers(data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to load users";
                setFetchError(errorMessage);
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    // Transform users to Mantine Select data format with custom render data
    const selectData: (ComboboxItem & Partial<UserSelectItemProps>)[] =
        users.map((user) => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatarUrl: (user as any).avatarUrl || null,
            firstName: user.firstName,
            lastName: user.lastName,
        }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={selectData}
            value={value}
            onChange={onChange}
            disabled={disabled || loading}
            required={required}
            error={error || fetchError}
            clearable={clearable}
            searchable
            nothingFoundMessage={resources.nothingFoundMessage}
            renderOption={(item) => (
                <SelectItem
                    label={item.option.label}
                    email={(item.option as any).email || ""}
                    avatarUrl={(item.option as any).avatarUrl}
                    firstName={(item.option as any).firstName || ""}
                    lastName={(item.option as any).lastName || ""}
                />
            )}
        />
    );
}
