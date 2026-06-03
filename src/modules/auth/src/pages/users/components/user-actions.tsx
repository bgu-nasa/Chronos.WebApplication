import { Button } from "@mantine/core";
import { useUserEditorStore } from "@/modules/auth/src/state/user-editor.store";
import { useDeleteUser } from "@/modules/auth/src/hooks/use-users";
import { useConfirmation } from "@/common/hooks/use-confirmation";
import { ConfirmationDialog } from "@/common/components/confirmation-dialog";
import type { UserData } from "@/modules/auth/src/pages/users/components/user-table/types";
import resourcesJson from "@/modules/auth/src/pages/users/users-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/auth/src/pages/users/users-page.resources.json",
    resourcesJson,
);
interface UserActionsProps {
    selectedUser: UserData | null;
}

export function UserActions({ selectedUser }: UserActionsProps) {
    const { openForCreate, openForEdit } = useUserEditorStore();
    const { deleteUser } = useDeleteUser();
    const {
        confirmationState,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        isLoading,
    } = useConfirmation();

    const handleCreateClick = () => {
        openForCreate();
    };

    const handleEditClick = () => {
        if (selectedUser) {
            openForEdit({
                id: selectedUser.id,
                email: selectedUser.email,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                verified: selectedUser.verified,
                avatarUrl: selectedUser.avatarUrl || null,
            });
        }
    };

    const handleDeleteClick = () => {
        if (selectedUser) {
            openConfirmation({
                title: resources.deleteConfirmTitle
                    .replace("{firstName}", selectedUser.firstName)
                    .replace("{lastName}", selectedUser.lastName),
                message: resources.deleteConfirmMessage,
                onConfirm: async () => {
                    await deleteUser(selectedUser.id);
                },
            });
        }
    };

    return (
        <>
            <Button.Group mb="md">
                <Button onClick={handleCreateClick}>
                    {resources.createButton}
                </Button>
                <Button onClick={handleEditClick} disabled={!selectedUser}>
                    {resources.editButton}
                </Button>
                <Button onClick={handleDeleteClick} disabled={!selectedUser}>
                    {resources.deleteButton}
                </Button>
            </Button.Group>
            <ConfirmationDialog
                opened={confirmationState.isOpen}
                onClose={closeConfirmation}
                onConfirm={handleConfirm}
                title={confirmationState.title}
                message={confirmationState.message}
                confirmText={resources.deleteConfirmButton}
                loading={isLoading}
            />
        </>
    );
}
