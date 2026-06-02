import { useState, useMemo } from "react";
import {
    Modal,
    Button,
    Stack,
    Group,
    PasswordInput,
    Alert,
} from "@mantine/core";
import { useUpdatePassword } from "@/modules/auth/src/hooks/use-auth";
import {
    validatePassword,
    validatePasswordMatch,
} from "@/modules/auth/src/common/validation.service";
import resourcesJson from "./update-password-modal.resources.json";
import { translatedResources } from "@/infra/i18n";
import { sharedNotifications } from "@/infra/i18n/shared-notifications";

const resources = translatedResources(
    "src/modules/auth/src/pages/profile-settings/components/update-password-modal.resources.json",
    resourcesJson,
);
interface UpdatePasswordModalProps {
    opened: boolean;
    onClose: () => void;
}

interface PasswordFormValues {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function UpdatePasswordModal({
    opened,
    onClose,
}: UpdatePasswordModalProps) {
    const { updatePassword, isLoading } = useUpdatePassword();

    const [formValues, setFormValues] = useState<PasswordFormValues>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Compute errors reactively based on current field values and touched state
    const oldPasswordError = useMemo(() => {
        return touched.oldPassword && !formValues.oldPassword
            ? resources.validation.oldPasswordRequired
            : undefined;
    }, [formValues.oldPassword, touched.oldPassword]);

    const newPasswordError = useMemo(() => {
        return touched.newPassword
            ? validatePassword(formValues.newPassword)
            : undefined;
    }, [formValues.newPassword, touched.newPassword]);

    const confirmPasswordError = useMemo(() => {
        return touched.confirmPassword
            ? validatePasswordMatch(
                  formValues.newPassword,
                  formValues.confirmPassword,
              )
            : undefined;
    }, [
        formValues.newPassword,
        formValues.confirmPassword,
        touched.confirmPassword,
    ]);

    const validateForm = (): boolean => {
        // Mark all fields as touched for validation display
        setTouched({
            oldPassword: true,
            newPassword: true,
            confirmPassword: true,
        });

        const hasOldPassword = !!formValues.oldPassword;
        const newPasswordValidation = validatePassword(formValues.newPassword);
        const confirmPasswordValidation = validatePasswordMatch(
            formValues.newPassword,
            formValues.confirmPassword,
        );

        return (
            hasOldPassword &&
            !newPasswordValidation &&
            !confirmPasswordValidation
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (!validateForm()) {
            return;
        }

        const success = await updatePassword({
            oldPassword: formValues.oldPassword,
            newPassword: formValues.newPassword,
        });

        if (success) {
            setSuccessMessage(resources.successMessage);
            // Reset form
            setFormValues({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setTouched({
                oldPassword: false,
                newPassword: false,
                confirmPassword: false,
            });
            // Close modal after a delay
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 2000);
        }
    };

    const handleClose = () => {
        // Reset form on close
        setFormValues({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setTouched({
            oldPassword: false,
            newPassword: false,
            confirmPassword: false,
        });
        setSuccessMessage(null);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={resources.title}
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {successMessage && (
                        <Alert color="green" title={sharedNotifications.successTitle}>
                            {successMessage}
                        </Alert>
                    )}

                    <PasswordInput
                        label={resources.form.oldPassword}
                        placeholder="••••••••"
                        required
                        value={formValues.oldPassword}
                        onChange={(e) =>
                            setFormValues((prev) => ({
                                ...prev,
                                oldPassword: e.target.value,
                            }))
                        }
                        onBlur={() =>
                            setTouched((prev) => ({
                                ...prev,
                                oldPassword: true,
                            }))
                        }
                        error={oldPasswordError}
                        disabled={isLoading}
                    />

                    <PasswordInput
                        label={resources.form.newPassword}
                        placeholder="••••••••"
                        required
                        value={formValues.newPassword}
                        onChange={(e) =>
                            setFormValues((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                            }))
                        }
                        onBlur={() =>
                            setTouched((prev) => ({
                                ...prev,
                                newPassword: true,
                            }))
                        }
                        error={newPasswordError}
                        disabled={isLoading}
                    />

                    <PasswordInput
                        label={resources.form.confirmPassword}
                        placeholder="••••••••"
                        required
                        value={formValues.confirmPassword}
                        onChange={(e) =>
                            setFormValues((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                            }))
                        }
                        onBlur={() =>
                            setTouched((prev) => ({
                                ...prev,
                                confirmPassword: true,
                            }))
                        }
                        error={confirmPasswordError}
                        disabled={isLoading}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {resources.buttons.cancel}
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            {resources.buttons.update}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
