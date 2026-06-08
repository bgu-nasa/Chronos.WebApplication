/**
 * DepartmentSelect Component
 * A Mantine Select dropdown for choosing departments from the current organization
 * Gets department data from $app.organization context
 * Shows deleted departments with strikethrough styling
 */

import { useEffect, useState } from "react";
import { Select, Text } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { $app } from "@/infra/service";
import type { Department } from "./department.types";

interface DepartmentSelectProps {
    value?: string | null;
    onChange?: (departmentId: string | null) => void;
    label?: string;
    placeholder?: string;
    nothingFoundMessage?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    clearable?: boolean;
    includeDeleted?: boolean; // Whether to show deleted departments
    includeAllOption?: boolean;
    allOptionLabel?: string;
    style?: React.CSSProperties;
    className?: string;
}

export const ALL_DEPARTMENTS = "__all__";

interface DepartmentSelectItemProps
    extends React.ComponentPropsWithoutRef<"div"> {
    label: string;
    deleted: boolean;
}

// Custom render function for select items
function SelectItem({ label, deleted, ...others }: DepartmentSelectItemProps) {
    return (
        <div {...others}>
            <Text
                size="sm"
                style={{
                    textDecoration: deleted ? "line-through" : "none",
                    color: deleted ? "var(--mantine-color-dimmed)" : undefined,
                }}
            >
                {label}
            </Text>
        </div>
    );
}

export function DepartmentSelect({
    value,
    onChange,
    label = "Department",
    placeholder = "Select a department",
    nothingFoundMessage = "No departments found",
    disabled = false,
    required = false,
    error,
    clearable = true,
    includeDeleted = false,
    includeAllOption = false,
    allOptionLabel = "All Departments",
    style,
    className,
}: DepartmentSelectProps) {
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        // Get departments from organization context
        const organization = $app.organization.getOrganization();
        if (organization?.departments) {
            const depts = includeDeleted
                ? organization.departments
                : organization.departments.filter((d) => !d.deleted);
            setDepartments(depts);
        } else {
            setDepartments([]);
        }
    }, [includeDeleted]);

    // Transform departments to Mantine Select data format
    const selectData: (ComboboxItem & Partial<DepartmentSelectItemProps>)[] = [
        ...(includeAllOption
            ? [{ value: ALL_DEPARTMENTS, label: allOptionLabel, deleted: false }]
            : []),
        ...departments.map((dept) => ({
            value: dept.id,
            label: dept.name,
            deleted: dept.deleted,
        })),
    ];

    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={selectData}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            error={error}
            clearable={clearable}
            style={style}
            className={className}
            searchable
            nothingFoundMessage={nothingFoundMessage}
            renderOption={(item) => (
                <SelectItem
                    label={item.option.label}
                    deleted={(item.option as any).deleted || false}
                />
            )}
        />
    );
}
