import { useState, useEffect } from "react";
import { Container, Divider, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { ConfirmationDialog, useConfirmation } from "@/common";
import { SubjectActions } from "./components/subject-actions";
import { SubjectTable } from "./components/subject-table/subject-table";
import { ALL_DEPARTMENTS, SubjectSearch, type SubjectSearchFilters } from "./components/subject-search";
import { SubjectCreator } from "./components/subject-creator";
import { SubjectEditor } from "./components/subject-editor";
import type { SubjectData } from "./components/subject-table/types";
import type { UpdateSubjectRequest } from "@/modules/resources/src/data";
import {
    useSubjects,
    useCreateSubject,
    useUpdateSubject,
    useDeleteSubject,
} from "@/modules/resources/src/hooks";
import resourcesJson from "./subjects-page.resources.json";
import styles from "./subjects-page.module.css";
import { schedulingPeriodRepository, departmentRepository } from "@/modules/resources/src/data";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/resources/src/pages/subjects-page/subjects-page.resources.json", resourcesJson);

export function SubjectsPage() {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);
    const [currentDepartmentName, setCurrentDepartmentName] = useState<string | null>(null);
    const [codeFilter, setCodeFilter] = useState<string>("");
    const [nameFilter, setNameFilter] = useState<string>("");
    const [schedulingPeriods, setSchedulingPeriods] = useState<Map<string, string>>(new Map());
    const [departmentsMap, setDepartmentsMap] = useState<Map<string, string>>(new Map());
    
    const { subjects, fetchSubjects, setCurrentDepartment } = useSubjects();
    const { createSubject, isLoading: isCreating } = useCreateSubject();
    const { updateSubject, isLoading: isEditing } = useUpdateSubject();
    const { deleteSubject } = useDeleteSubject();
    
    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading: isDeleting,
    } = useConfirmation();

    // Fetch scheduling periods and build departments map on mount
    useEffect(() => {
        const loadSchedulingPeriods = async () => {
            try {
                const periods = await schedulingPeriodRepository.getAll();
                const periodsMap = new Map(periods.map((p) => [p.id, p.name]));
                setSchedulingPeriods(periodsMap);
                $app.logger.info(resources.logger.loadedSchedulingPeriods, { count: periods.length });
            } catch (error) {
                $app.logger.error(resources.logger.errorLoadingSchedulingPeriods, error);
            }
        };
        loadSchedulingPeriods();

        const org = $app.organization.getOrganization();
        if (org?.departments) {
            const deptsMap = new Map(
                org.departments.filter((d) => !d.deleted).map((d) => [d.id, d.name])
            );
            setDepartmentsMap(deptsMap);
        }
    }, []);

    const handleSearch = async (filters: SubjectSearchFilters) => {
        const isAllDepartments = filters.departmentId === ALL_DEPARTMENTS;

        if (isAllDepartments) {
            setCurrentDepartmentId(ALL_DEPARTMENTS);
            setCurrentDepartmentName(null);

            const org = $app.organization.getOrganization();
            const apiDepartmentId = org?.departments?.find((d) => !d.deleted)?.id;
            if (!apiDepartmentId) {
                return;
            }
            setCurrentDepartment(apiDepartmentId);
        } else {
            try {
                const department = await departmentRepository.getById(filters.departmentId);
                setCurrentDepartmentName(department.name);
                $app.logger.info(resources.logger.fetchedDepartment, { id: department.id, name: department.name });
            } catch (error) {
                $app.logger.error(resources.logger.errorFetchingDepartment, error);
                setCurrentDepartmentName(resources.unknownDepartment);
            }

            setCurrentDepartmentId(filters.departmentId);
            setCurrentDepartment(filters.departmentId);
        }

        setCodeFilter(filters.code);
        setNameFilter(filters.name);
        fetchSubjects();
    };

    const handleClearFilters = () => {
        setCodeFilter("");
        setNameFilter("");
        setSelectedSubject(null);
    };

    const handleCreateClick = () => {
        setCreateModalOpened(true);
    };

    const handleCreateSubmit = async (data: { code: string; name: string; schedulingPeriodId: string; departmentId?: string }) => {
        $app.logger.info(resources.logger.handleCreateSubmitCalled, data);
        $app.logger.info(resources.logger.currentDepartmentId, currentDepartmentId);

        const departmentId = data.departmentId ?? (currentDepartmentId !== ALL_DEPARTMENTS ? currentDepartmentId : null);
        if (!departmentId) {
            $app.logger.error(resources.logger.noDepartmentIdSet);
            return;
        }

        const org = $app.organization.getOrganization();
        $app.logger.info(resources.logger.organizationFromContext, org);

        if (!org?.id) {
            $app.logger.error(resources.logger.noOrganizationContext);
            return;
        }

        const request = {
            organizationId: org.id,
            departmentId,
            schedulingPeriodId: data.schedulingPeriodId,
            code: data.code,
            name: data.name,
        };

        $app.logger.info(resources.logger.sendingCreateRequest, request);

        try {
            const result = await createSubject(request);
            $app.logger.info(resources.logger.createSubjectResult, result);
            
            if (result) {
                setCreateModalOpened(false);
                fetchSubjects();
            } else {
                $app.logger.error(resources.logger.createSubjectReturnedNull);
            }
        } catch (error) {
            $app.logger.error(resources.logger.errorCreatingSubject, error);
        }
    };

    const handleEditClick = () => {
        if (selectedSubject) {
            setEditModalOpened(true);
        }
    };

    const handleEditSubmit = async (data: { code: string; name: string; schedulingPeriodId: string }) => {
        $app.logger.info(resources.logger.handleEditSubmitCalled, data);
        $app.logger.info(resources.logger.selectedSubject, selectedSubject);
        $app.logger.info(resources.logger.currentDepartmentId, currentDepartmentId);
        
        if (!selectedSubject) {
            $app.logger.error(resources.logger.missingSubjectOrDepartment);
            return;
        }

        const departmentId = currentDepartmentId === ALL_DEPARTMENTS
            ? selectedSubject.departmentId
            : currentDepartmentId;
        if (!departmentId) {
            $app.logger.error(resources.logger.missingSubjectOrDepartment);
            return;
        }

        const org = $app.organization.getOrganization();
        $app.logger.info(resources.logger.organizationFromContext, org);

        if (!org?.id) {
            $app.logger.error(resources.logger.noOrganizationContext);
            return;
        }

        const request: UpdateSubjectRequest = {
            organizationId: org.id,
            departmentId,
            schedulingPeriodId: data.schedulingPeriodId,
            code: data.code,
            name: data.name,
        };

        $app.logger.info(resources.logger.sendingUpdateRequest, request);

        try {
            const success = await updateSubject(selectedSubject.id, request);
            $app.logger.info(resources.logger.updateSubjectResult, success);
            
            if (success) {
                setEditModalOpened(false);
                setSelectedSubject(null);
                fetchSubjects();
            } else {
                $app.logger.error(resources.logger.updateSubjectReturnedFalse);
            }
        } catch (error) {
            $app.logger.error(resources.logger.errorUpdatingSubject, error);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedSubject) return;

        openConfirmation({
            title: resources.deleteConfirmTitle,
            message: resources.deleteConfirmMessage.replace(
                "{name}",
                selectedSubject.name
            ),
            onConfirm: async () => {
                const success = await deleteSubject(selectedSubject.id);
                if (success) {
                    setSelectedSubject(null);
                    fetchSubjects(); // Refresh the list
                }
            },
        });
    };

    const handleViewActivitiesClick = () => {
        if (!selectedSubject) return;

        const departmentId = currentDepartmentId === ALL_DEPARTMENTS
            ? selectedSubject.departmentId
            : currentDepartmentId;
        if (departmentId) {
            navigate(
                `/resources/activities?subjectId=${selectedSubject.id}&departmentId=${departmentId}`
            );
        }
    };

    const isAllDepartments = currentDepartmentId === ALL_DEPARTMENTS;

    const subjectData: SubjectData[] = currentDepartmentId
        ? subjects
            .filter((subject) => {
                if (!isAllDepartments && subject.departmentId !== currentDepartmentId) return false;

                if (codeFilter && !subject.code.toLowerCase().includes(codeFilter.toLowerCase())) {
                    return false;
                }

                if (nameFilter && !subject.name.toLowerCase().includes(nameFilter.toLowerCase())) {
                    return false;
                }

                return true;
            })
             .map((subject) => ({
                 id: subject.id,
                 code: subject.code,
                 name: subject.name,
                 departmentName: isAllDepartments
                     ? departmentsMap.get(subject.departmentId) || resources.unknownDepartment
                     : currentDepartmentName || resources.loadingText,
                 schedulingPeriodName: schedulingPeriods.get(subject.schedulingPeriodId) || resources.unknownText,
                 departmentId: subject.departmentId,
                 schedulingPeriodId: subject.schedulingPeriodId,
             }))
        : [];

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <SubjectSearch 
                    onSearch={handleSearch}
                    onClear={handleClearFilters}
                />

                <SubjectActions
                    selectedSubject={selectedSubject}
                    onCreateClick={handleCreateClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onViewActivitiesClick={handleViewActivitiesClick}
                    hasDepartmentContext={!!currentDepartmentId}
                />

                <SubjectTable
                    subjects={subjectData}
                    selectedSubject={selectedSubject}
                    onSelectionChange={setSelectedSubject}
                />

                <SubjectCreator
                    opened={createModalOpened}
                    onClose={() => setCreateModalOpened(false)}
                    onSubmit={handleCreateSubmit}
                    loading={isCreating}
                    showDepartmentPicker={isAllDepartments}
                />

                <SubjectEditor
                    opened={editModalOpened}
                    onClose={() => setEditModalOpened(false)}
                    onSubmit={handleEditSubmit}
                    loading={isEditing}
                    initialData={
                        selectedSubject
                            ? { 
                                code: selectedSubject.code, 
                                name: selectedSubject.name,
                                schedulingPeriodId: selectedSubject.schedulingPeriodId
                            }
                            : undefined
                    }
                />

                <ConfirmationDialog
                    opened={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={handleConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={resources.deleteConfirmButton}
                    cancelText={resources.deleteCancelButton}
                    loading={isDeleting}
                />
            </div>
        </Container>
    );
}
