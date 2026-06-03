/**
 * UserScopedRoleEditor Component
 * Drawer for editing role assignments for a specific user in a specific scope
 * Shows user info, scope details, and toggleable role chips
 */

import { useState, useEffect } from "react";
import { Drawer, Stack, Text, Chip, Group } from "@mantine/core";
import { UserInfo, CopiableInput } from "@/common";
import {
    useCreateRoleAssignment,
    useRemoveRoleAssignment,
} from "@/modules/management/src/hooks/use-roles";
import type { RoleType } from "@/modules/management/src/data/role.types";
import type { RoleTableRow } from "@/modules/management/src/pages/roles-page/components/role-table/types";
import { $app } from "@/infra/service";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/roles-page/roles-page.resources.json",
    resourcesJson,
);
interface UserScopedRoleEditorProps {
    opened: boolean;
    onClose: () => void;
    selectedRow: RoleTableRow | null;
}

export function UserScopedRoleEditor({
    opened,
    onClose,
    selectedRow,
}: UserScopedRoleEditorProps) {
    const { createRoleAssignment, isLoading: isCreating } =
        useCreateRoleAssignment();
    const { removeRoleAssignment, isLoading: isRemoving } =
        useRemoveRoleAssignment();

    const [activeRoles, setActiveRoles] = useState<RoleType[]>([]);

    // All possible roles
    const allRoles: RoleType[] = [
        "Administrator",
        "UserManager",
        "ResourceManager",
        "Operator",
        "Viewer",
    ];

    // Get user details from $app (to get avatar, name, etc.)
    const organization = $app.organization.getOrganization();
    const [userDetails, setUserDetails] = useState<{
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
    } | null>(null);

    useEffect(() => {
        // In a real scenario, we'd fetch user details from an API
        // For now, we'll use placeholder data since we only have email
        if (selectedRow) {
            // You could fetch user details here if needed
            // For now using email to extract a "name"
            const emailName = selectedRow.userEmail.split("@")[0];
            setUserDetails({
                firstName: emailName,
                lastName: "",
                avatarUrl: null,
            });
        }
    }, [selectedRow]);

    // Update active roles when selectedRow changes
    useEffect(() => {
        if (selectedRow) {
            setActiveRoles(selectedRow.roles);
        }
    }, [selectedRow]);

    const getDepartmentName = (deptId: string | null): string | null => {
        if (!deptId) return null;
        const department = organization?.departments.find(
            (d) => d.id === deptId
        );
        return department?.name || null;
    };

    const handleRoleToggle = async (role: RoleType) => {
        if (!selectedRow) return;

        const isActive = activeRoles.includes(role);

        if (isActive) {
            // Remove role assignment
            const assignmentToRemove =
                selectedRow.assignmentIds[selectedRow.roles.indexOf(role)];
            if (assignmentToRemove) {
                const success = await removeRoleAssignment(assignmentToRemove);
                if (success) {
                    setActiveRoles((prev) => prev.filter((r) => r !== role));
                }
            }
        } else {
            // Create role assignment
            const result = await createRoleAssignment({
                userId: selectedRow.userId,
                departmentId: selectedRow.scopeId,
                role: role,
            });
            if (result) {
                setActiveRoles((prev) => [...prev, role]);
            }
        }
    };

    if (!selectedRow || !userDetails) {
        return null;
    }

    const departmentName = getDepartmentName(selectedRow.scopeId);
    const scopeText =
        selectedRow.scope === "Organization"
            ? resources.editorScopeOrg
            : resources.editorScopeDept.replace(
                  "{departmentName}",
                  departmentName || selectedRow.scopeId || "Unknown"
              );

    const scopeId = selectedRow.scopeId || organization?.id || "N/A";
    const isLoading = isCreating || isRemoving;

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={resources.editorTitle}
            position="right"
            size="md"
        >
            <Stack gap="lg">
                <Text size="sm" c="dimmed">
                    {resources.editorSubtitle}
                </Text>

                <UserInfo
                    firstName={userDetails.firstName}
                    lastName={userDetails.lastName}
                    email={selectedRow.userEmail}
                    avatarUrl={userDetails.avatarUrl}
                    avatarSize="md"
                />

                <Stack gap="xs">
                    <Text size="sm" fw={500}>
                        {resources.editorScopeLabel}
                    </Text>
                    <Text size="sm">{scopeText}</Text>
                </Stack>

                <CopiableInput
                    label={resources.editorScopeIdLabel}
                    value={scopeId}
                />

                <Stack gap="xs">
                    <Text size="sm" fw={500}>
                        {resources.rolesColumn}
                    </Text>
                    <Chip.Group multiple value={activeRoles}>
                        <Group gap="xs">
                            {allRoles.map((role) => (
                                <Chip
                                    key={role}
                                    value={role}
                                    checked={activeRoles.includes(role)}
                                    onChange={() => handleRoleToggle(role)}
                                    disabled={isLoading}
                                >
                                    {role}
                                </Chip>
                            ))}
                        </Group>
                    </Chip.Group>
                </Stack>
            </Stack>
        </Drawer>
    );
}
