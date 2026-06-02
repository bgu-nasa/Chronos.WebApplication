/**
 * RoleSelect Component
 * A Mantine Select dropdown for choosing role types
 */

import { Select } from "@mantine/core";
import type { RoleType } from "@/modules/management/src/data/role.types";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/roles-page/roles-page.resources.json",
    resourcesJson,
);
interface RoleSelectProps {
    value?: RoleType | null;
    onChange?: (role: RoleType | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

export function RoleSelect({
    value,
    onChange,
    label,
    placeholder,
    disabled = false,
    required = false,
    error,
}: RoleSelectProps) {
    const roles: RoleType[] = [
        "Administrator",
        "UserManager",
        "ResourceManager",
        "Operator",
        "Viewer",
    ];

    const selectData = roles.map((role) => ({
        value: role,
        label: role,
    }));

    const handleChange = (val: string | null) => {
        onChange?.(val as RoleType | null);
    };

    return (
        <Select
            label={label || resources.roleLabel}
            placeholder={placeholder || resources.rolePlaceholder}
            data={selectData}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            error={error}
        />
    );
}
