import { useEffect, useState, useMemo } from "react";
import {
    Drawer,
    TextInput,
    Button,
    Stack,
    Group,
    Modal,
    Avatar,
    Alert,
} from "@mantine/core";
import { useUserEditorStore } from "@/modules/auth/src/state/user-editor.store";
import {
    useCreateUser,
    useUpdateUser,
} from "@/modules/auth/src/hooks/use-users";
import { generateSecurePassword } from "@/modules/auth/src/common/password-generator";
import {
    validateEmail,
    validateFirstName,
    validateLastName,
} from "@/modules/auth/src/common/validation.service";
import { CopiableInput } from "@/common/components/copiable-input";
import resourcesJson from "./user-editor.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/auth/src/pages/users/components/user-editor/user-editor.resources.json",
    resourcesJson,
);
interface UserFormValues {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export function UserEditor() {
    const {
        isOpen,
        mode,
        editingUser,
        generatedPassword,
        close,
        setGeneratedPassword,
        clearGeneratedPassword,
    } = useUserEditorStore();
    const { createUser, isLoading: isCreating } = useCreateUser();
    const { updateUser, isLoading: isUpdating } = useUpdateUser();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formValues, setFormValues] = useState<UserFormValues>({
        email: "",
        firstName: "",
        lastName: "",
        avatarUrl: null,
    });
    const [touched, setTouched] = useState({
        email: false,
        firstName: false,
        lastName: false,
    });

    // Reset form when drawer opens/closes or editing user changes
    useEffect(() => {
        if (isOpen && mode === "edit" && editingUser) {
            setFormValues({
                email: editingUser.email,
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                avatarUrl: editingUser.avatarUrl || null,
            });
        } else if (isOpen && mode === "create") {
            setFormValues({
                email: "",
                firstName: "",
                lastName: "",
                avatarUrl: null,
            });
        }
        setTouched({ email: false, firstName: false, lastName: false });
    }, [isOpen, mode, editingUser]);

    // Compute errors reactively based on current field values and touched state
    const emailError = useMemo(() => {
        return touched.email ? validateEmail(formValues.email) : undefined;
    }, [formValues.email, touched.email]);

    const firstNameError = useMemo(() => {
        return touched.firstName
            ? validateFirstName(formValues.firstName)
            : undefined;
    }, [formValues.firstName, touched.firstName]);

    const lastNameError = useMemo(() => {
        return touched.lastName
            ? validateLastName(formValues.lastName)
            : undefined;
    }, [formValues.lastName, touched.lastName]);

    const validateForm = (): boolean => {
        // Mark all fields as touched for validation display
        setTouched({ email: true, firstName: true, lastName: true });

        const emailValidation = validateEmail(formValues.email);
        const firstNameValidation = validateFirstName(formValues.firstName);
        const lastNameValidation = validateLastName(formValues.lastName);

        return !emailValidation && !firstNameValidation && !lastNameValidation;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (mode === "create") {
            // Generate password for new user
            const password = generateSecurePassword();

            const result = await createUser({
                email: formValues.email,
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                password: password,
            });

            if (result) {
                setGeneratedPassword(password);
                setShowPasswordModal(true);
            }
        } else if (mode === "edit" && editingUser) {
            const success = await updateUser(editingUser.id, {
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                avatarUrl: formValues.avatarUrl,
            });

            if (success) {
                close();
            }
        }
    };

    const handlePasswordModalClose = () => {
        setShowPasswordModal(false);
        clearGeneratedPassword();
        close();
    };

    const isLoading = isCreating || isUpdating;

    return (
        <>
            <Drawer
                opened={isOpen}
                onClose={close}
                title={resources.drawerTitle[mode]}
                position="right"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <TextInput
                            label={resources.form.email}
                            placeholder={resources.form.emailPlaceholder}
                            required
                            disabled={mode === "edit"}
                            value={formValues.email}
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            onBlur={() =>
                                setTouched((prev) => ({ ...prev, email: true }))
                            }
                            error={emailError}
                        />

                        <TextInput
                            label={resources.form.firstName}
                            placeholder={resources.form.firstNamePlaceholder}
                            required
                            value={formValues.firstName}
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                }))
                            }
                            onBlur={() =>
                                setTouched((prev) => ({
                                    ...prev,
                                    firstName: true,
                                }))
                            }
                            error={firstNameError}
                        />

                        <TextInput
                            label={resources.form.lastName}
                            placeholder={resources.form.lastNamePlaceholder}
                            required
                            value={formValues.lastName}
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            onBlur={() =>
                                setTouched((prev) => ({
                                    ...prev,
                                    lastName: true,
                                }))
                            }
                            error={lastNameError}
                        />

                        {mode === "edit" && (
                            <Stack gap="xs">
                                <Group gap="md" align="flex-start">
                                    <Avatar
                                        src={formValues.avatarUrl}
                                        size="lg"
                                        radius="md"
                                    />
                                    <TextInput
                                        label={resources.form.avatarUrl}
                                        placeholder="https://example.com/avatar.jpg"
                                        style={{ flex: 1 }}
                                        value={formValues.avatarUrl || ""}
                                        onChange={(e) =>
                                            setFormValues((prev) => ({
                                                ...prev,
                                                avatarUrl:
                                                    e.target.value || null,
                                            }))
                                        }
                                    />
                                </Group>
                            </Stack>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="default"
                                onClick={close}
                                disabled={isLoading}
                            >
                                {resources.buttons.cancel}
                            </Button>
                            <Button type="submit" loading={isLoading}>
                                {mode === "create"
                                    ? resources.buttons.create
                                    : resources.buttons.save}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Password Display Modal */}
            <Modal
                opened={showPasswordModal}
                onClose={handlePasswordModalClose}
                title={resources.passwordModal.title}
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                <Stack gap="md">
                    <Alert color="blue">
                        {resources.passwordModal.message}
                    </Alert>

                    <CopiableInput
                        label={resources.passwordModal.emailLabel}
                        value={formValues.email}
                    />

                    <CopiableInput
                        label={resources.passwordModal.passwordLabel}
                        value={generatedPassword || ""}
                    />

                    <Button fullWidth onClick={handlePasswordModalClose}>
                        {resources.passwordModal.closeButton}
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}
