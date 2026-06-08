import { Button, TextInput, Group, Paper } from "@mantine/core";
import { ALL_DEPARTMENTS, DepartmentSelect } from "@/common/components/department-select";
import { translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";
import { useState, useEffect } from "react";
import subjectsPageResourcesJson from "../subjects-page.resources.json";

const resources = translatedResources(
    "src/modules/resources/src/pages/subjects-page/subjects-page.resources.json",
    subjectsPageResourcesJson,
);

export { ALL_DEPARTMENTS };

export interface SubjectSearchFilters {
    departmentId: string;
    code: string;
    name: string;
}

interface SubjectSearchProps {
    onSearch: (filters: SubjectSearchFilters) => void;
    onClear: () => void;
}

export function SubjectSearch({ onSearch, onClear }: SubjectSearchProps) {
    useLocaleStore((state) => state.language);
    const [departmentId, setDepartmentId] = useState<string>(ALL_DEPARTMENTS);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    // Automatically trigger search when any filter changes
    useEffect(() => {
        onSearch({ departmentId, code, name });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId, code, name]);

    const handleClear = () => {
        setDepartmentId(ALL_DEPARTMENTS);
        setCode("");
        setName("");
        onClear();
    };

    return (
        <Paper shadow="xs" p="md" mb="md">
            <Group align="flex-end">
                <div style={{ flex: 1 }}>
                    <DepartmentSelect
                        value={departmentId}
                        onChange={(value) => setDepartmentId(value || ALL_DEPARTMENTS)}
                        label={resources.filters.departmentLabel}
                        placeholder={resources.filters.departmentPlaceholder}
                        nothingFoundMessage={resources.filters.noDepartmentsFound}
                        includeAllOption
                        allOptionLabel={resources.filters.allDepartmentsOption}
                        clearable={false}
                    />
                </div>
                <TextInput
                    label={resources.filters.codeLabel}
                    placeholder={resources.filters.codePlaceholder}
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                <TextInput
                    label={resources.filters.nameLabel}
                    placeholder={resources.filters.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                <Button variant="outline" onClick={handleClear}>
                    {resources.filters.clearButton}
                </Button>
            </Group>
        </Paper>
    );
}
