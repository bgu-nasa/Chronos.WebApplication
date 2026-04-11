import { useEffect, useState, useMemo } from "react";
import { Container, Divider, Title } from "@mantine/core";
import { RoleActions } from "@/modules/management/src/pages/roles-page/components/role-actions";
import {
    RoleTable,
    type RoleTableRow,
} from "@/modules/management/src/pages/roles-page/components/role-table";
import { RoleAssignmentDrawer } from "@/modules/management/src/pages/roles-page/components/role-assignment-drawer";
import { UserScopedRoleEditor } from "@/modules/management/src/pages/roles-page/components/user-scoped-role-editor";
import { useRoleAssignments } from "@/modules/management/src/hooks/use-roles";
import type { UserRoleAssignmentSummary } from "@/modules/management/src/data/role.types";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import styles from "@/modules/management/src/pages/roles-page/roles-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/management/src/pages/roles-page/roles-page.resources.json", resourcesJson);

export function RolesPage() {
    const [selectedRow, setSelectedRow] = useState<RoleTableRow | null>(null);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [editorOpened, setEditorOpened] = useState(false);
    const { roleAssignments, fetchRoleAssignments } = useRoleAssignments();

    // Fetch role assignments on mount
    useEffect(() => {
        fetchRoleAssignments();
    }, []);

    // Open editor when a row is selected
    useEffect(() => {
        if (selectedRow) {
            setEditorOpened(true);
        }
    }, [selectedRow]);

    const handleCreateClick = () => {
        setDrawerOpened(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpened(false);
    };

    const handleCloseEditor = () => {
        setEditorOpened(false);
        setSelectedRow(null);
    };

    // Transform UserRoleAssignmentSummary to RoleTableRow
    // Split each user's assignments into org-level and dept-level rows
    const tableRows = useMemo(() => {
        const rows: RoleTableRow[] = [];

        roleAssignments.forEach((summary: UserRoleAssignmentSummary) => {
            // Group assignments by scope (org vs dept)
            const orgAssignments = summary.assignments.filter(
                (a) => a.departmentId === null
            );
            const deptAssignments = summary.assignments.filter(
                (a) => a.departmentId !== null
            );

            // Create row for organization-level roles
            if (orgAssignments.length > 0) {
                rows.push({
                    id: `${summary.userEmail}-org`,
                    userId: orgAssignments[0].userId, // Get userId from first assignment
                    userEmail: summary.userEmail,
                    scope: "Organization",
                    scopeId: null,
                    scopeName: "Organization",
                    roles: orgAssignments.map((a) => a.role),
                    assignmentIds: orgAssignments.map((a) => a.id),
                });
            }

            // Group department assignments by department
            const deptGroups = new Map<string, typeof deptAssignments>();
            deptAssignments.forEach((assignment) => {
                const deptId = assignment.departmentId!;
                if (!deptGroups.has(deptId)) {
                    deptGroups.set(deptId, []);
                }
                deptGroups.get(deptId)!.push(assignment);
            });

            // Create a row for each department
            deptGroups.forEach((assignments, deptId) => {
                rows.push({
                    id: `${summary.userEmail}-dept-${deptId}`,
                    userId: assignments[0].userId, // Get userId from first assignment
                    userEmail: summary.userEmail,
                    scope: "Department",
                    scopeId: deptId,
                    scopeName: deptId, // Will be resolved in the table component
                    roles: assignments.map((a) => a.role),
                    assignmentIds: assignments.map((a) => a.id),
                });
            });
        });

        return rows;
    }, [roleAssignments]);

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <RoleActions onCreateClick={handleCreateClick} />

                <RoleTable
                    rows={tableRows}
                    selectedRow={selectedRow}
                    onSelectionChange={setSelectedRow}
                />

                <RoleAssignmentDrawer
                    opened={drawerOpened}
                    onClose={handleCloseDrawer}
                />

                <UserScopedRoleEditor
                    opened={editorOpened}
                    onClose={handleCloseEditor}
                    selectedRow={selectedRow}
                />
            </div>
        </Container>
    );
}
