import { useState, useEffect } from "react";
import { Container, Divider, Title, Loader, Center } from "@mantine/core";
import { UserActions } from "@/modules/auth/src/pages/users/components/user-actions";
import { UserTable } from "@/modules/auth/src/pages/users/components/user-table/user-table";
import { UserEditor } from "@/modules/auth/src/pages/users/components/user-editor";
import type { UserData } from "@/modules/auth/src/pages/users/components/user-table/types";
import { useUsers } from "@/modules/auth/src/hooks/use-users";
import resourcesJson from "@/modules/auth/src/pages/users/users-page.resources.json";
import styles from "./users-page.module.css";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/auth/src/pages/users/users-page.resources.json", resourcesJson);

export function UsersPage() {
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const { users, isLoading, fetchUsers } = useUsers();

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Clear selection if the selected user no longer exists in the users list
    useEffect(() => {
        if (selectedUser && !users.find((u) => u.id === selectedUser.id)) {
            setSelectedUser(null);
        }
    }, [users, selectedUser]);

    // Map UserResponse to UserData for the table component
    const userData: UserData[] = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl || undefined,
        verified: user.verified,
    }));

    return (
        <Container size="xl" py="xl">
            <div className={styles.container}>
                <Title order={1}>{resources.title}</Title>
                <Divider className={styles.divider} />

                <UserActions selectedUser={selectedUser} />

                {isLoading ? (
                    <Center mt="xl">
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <UserTable
                        users={userData}
                        selectedUser={selectedUser}
                        onSelectionChange={setSelectedUser}
                    />
                )}

                <UserEditor />
            </div>
        </Container>
    );
}
