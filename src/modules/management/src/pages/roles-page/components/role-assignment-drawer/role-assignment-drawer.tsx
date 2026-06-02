/**
 * RoleAssignmentDrawer Component
 * Drawer for creating new role assignments
 * Uses Mantine Drawer with form controls
 */

import { useState, useEffect } from "react";
import { Drawer, Stack, Button, Text, Group } from "@mantine/core";
import { UserSelect, DepartmentSelect } from "@/common";
import { RoleSelect } from "@/modules/management/src/pages/roles-page/components/role-select";
import { useCreateRoleAssignment } from "@/modules/management/src/hooks/use-roles";
import type { RoleType } from "@/modules/management/src/data/role.types";
import { $app } from "@/infra/service";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/roles-page/roles-page.resources.json",
    resourcesJson,
);
interface RoleAssignmentDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export function RoleAssignmentDrawer({
    opened,
    onClose,
}: RoleAssignmentDrawerProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [role, setRole] = useState<RoleType | null>(null);
    const [errors, setErrors] = useState<{
        user?: string;
        role?: string;
    }>({});

    const { createRoleAssignment, isLoading } = useCreateRoleAssignment();

    // Get department name for scope info display
    const getDepartmentName = (deptId: string | null): string | null => {
        if (!deptId) return null;
        const organization = $app.organization.getOrganization();
        const department = organization?.departments.find(
            (d) => d.id === deptId
        );
        return department?.name || null;
    };

    const departmentName = getDepartmentName(departmentId);

    // Reset form when drawer is closed
    useEffect(() => {
        if (!opened) {
            setUserId(null);
            setDepartmentId(null);
            setRole(null);
            setErrors({});
        }
    }, [opened]);

    const handleCreate = async () => {
        // Validate form
        const newErrors: typeof errors = {};
        if (!userId) {
            newErrors.user = resources.userRequired;
        }
        if (!role) {
            newErrors.role = resources.roleRequired;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Create role assignment
        const result = await createRoleAssignment({
            userId: userId!,
            departmentId: departmentId,
            role: role!,
        });

        if (result) {
            // Success - close drawer (form will be reset by useEffect)
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    // Scope info message
    const scopeInfo =
        departmentId && departmentName
            ? resources.scopeInfoDept.replace(
                  "{departmentName}",
                  departmentName
              )
            : resources.scopeInfoOrg;

    return (
        <Drawer
            opened={opened}
            onClose={handleCancel}
            title={resources.drawerTitle}
            position="right"
            size="md"
        >
            <Stack gap="md">
                <UserSelect
                    value={userId}
                    onChange={(val) => {
                        setUserId(val);
                        setErrors((prev) => ({ ...prev, user: undefined }));
                    }}
                    label={resources.userLabel}
                    placeholder={resources.userPlaceholder}
                    required
                    error={errors.user}
                />

                <DepartmentSelect
                    value={departmentId}
                    onChange={setDepartmentId}
                    label={resources.departmentLabel}
                    placeholder={resources.departmentPlaceholder}
                    includeDeleted
                />

                <RoleSelect
                    value={role}
                    onChange={(val) => {
                        setRole(val);
                        setErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    required
                    error={errors.role}
                />

                <Text size="sm" c="dimmed">
                    {scopeInfo}
                </Text>

                <Group justify="flex-end" mt="xl">
                    <Button
                        variant="default"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {resources.cancelButton}
                    </Button>
                    <Button onClick={handleCreate} loading={isLoading}>
                        {resources.createRoleButton}
                    </Button>
                </Group>
            </Stack>
        </Drawer>
    );
}
