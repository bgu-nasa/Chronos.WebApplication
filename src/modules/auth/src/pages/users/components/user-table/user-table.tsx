import { DataTable } from "primereact/datatable";
import type { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar, Badge } from "@mantine/core";
import type { UserData } from "./types";
import resourcesJson from "@/modules/auth/src/pages/users/users-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/auth/src/pages/users/users-page.resources.json",
    resourcesJson,
);
interface UserTableProps {
    users: UserData[];
    selectedUser: UserData | null;
    onSelectionChange: (user: UserData | null) => void;
}

export function UserTable({
    users,
    selectedUser,
    onSelectionChange,
}: UserTableProps) {
    const handleSelectionChange = (
        e: DataTableSelectionSingleChangeEvent<UserData[]>
    ) => {
        onSelectionChange(e.value as UserData | null);
    };

    const profileTemplate = (rowData: UserData) => {
        return (
            <Avatar
                src={rowData.avatarUrl}
                alt={`${rowData.firstName} ${rowData.lastName}`}
            />
        );
    };

    const verifiedTemplate = (rowData: UserData) => {
        return (
            <Badge color={rowData.verified ? "green" : "gray"} variant="filled">
                {rowData.verified ? resources.verified : resources.unverified}
            </Badge>
        );
    };

    return (
        <DataTable
            value={users}
            selection={selectedUser}
            onSelectionChange={handleSelectionChange}
            selectionMode="single"
            dataKey="id"
            stripedRows
            paginator
            rows={10}
        >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column
                field="profile"
                header={resources.profileColumn}
                body={profileTemplate}
            />
            <Column
                field="firstName"
                header={resources.firstNameColumn}
                sortable
            />
            <Column
                field="lastName"
                header={resources.lastNameColumn}
                sortable
            />
            <Column field="email" header={resources.emailColumn} sortable />
            <Column
                field="verified"
                header={resources.verifiedColumn}
                body={verifiedTemplate}
                sortable
            />
        </DataTable>
    );
}
