import { useEffect, useState } from "react";
import { Container, Divider, Title } from "@mantine/core";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { DepartmentActions } from "@/modules/management/src/pages/departments-page/components/department-actions";
import { DepartmentTable } from "@/modules/management/src/pages/departments-page/components/department-table/department-table";
import { DepartmentEditor } from "@/modules/management/src/pages/departments-page/components/department-editor";
import type { DepartmentData } from "@/modules/management/src/pages/departments-page/components/department-table/types";
import { useDepartmentEditorStore } from "@/modules/management/src/stores/department-editor.store";
import {
    useDepartments,
    useDeleteDepartment,
} from "@/modules/management/src/hooks/use-departments";
import resourcesJson from "@/modules/management/src/pages/departments-page/departments-page.resources.json";
import styles from "@/modules/management/src/pages/departments-page/departments-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/management/src/pages/departments-page/departments-page.resources.json", resourcesJson);

export function DepartmentsPage() {
    const [selectedDepartment, setSelectedDepartment] =
        useState<DepartmentData | null>(null);
    const { departments, fetchDepartments } = useDepartments();
    const { deleteDepartment } = useDeleteDepartment();
    const { openCreate, openEdit } = useDepartmentEditorStore();
    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isConfirming,
    } = useConfirmation();

    // Fetch departments on mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreateClick = () => {
        openCreate();
    };

    const handleEditClick = () => {
        if (selectedDepartment) {
            openEdit(selectedDepartment);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedDepartment) {
            return;
        }

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage.replace(
                "{name}",
                selectedDepartment.name
            ),
            onConfirm: async () => {
                const success = await deleteDepartment(selectedDepartment.id);
                if (success) {
                    // State automatically updated by store, just clear selection
                    setSelectedDepartment(null);
                }
            },
        });
    };

    // Convert DepartmentResponse to DepartmentData
    const departmentData: DepartmentData[] = departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        deleted: dept.deleted,
    }));

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <DepartmentActions
                    selectedDepartment={selectedDepartment}
                    onCreateClick={handleCreateClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />

                <DepartmentTable
                    departments={departmentData}
                    selectedDepartment={selectedDepartment}
                    onSelectionChange={setSelectedDepartment}
                />

                <DepartmentEditor />

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={resources.deleteConfirmButton}
                    cancelText={resources.deleteCancelButton}
                    loading={isConfirming}
                />
            </div>
        </Container>
    );
}
