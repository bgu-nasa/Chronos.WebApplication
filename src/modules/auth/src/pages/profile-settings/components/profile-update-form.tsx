import { useState, useEffect, useMemo } from "react";
import {
    TextInput,
    Button,
    Stack,
    Group,
    Avatar,
    Alert,
    Paper,
} from "@mantine/core";
import { useUpdateMyProfile } from "@/modules/auth/src/hooks/use-users";
import { useOrganization } from "@/infra/service";
import {
    validateFirstName,
    validateLastName,
} from "@/modules/auth/src/common/validation.service";
import resourcesJson from "./profile-update-form.resources.json";
import { translatedResources } from "@/infra/i18n";
import { sharedNotifications } from "@/infra/i18n/shared-notifications";

const resources = translatedResources(
    "src/modules/auth/src/pages/profile-settings/components/profile-update-form.resources.json",
    resourcesJson,
);
interface ProfileFormValues {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export function ProfileUpdateForm() {
    const { updateMyProfile, isLoading } = useUpdateMyProfile();
    const { organization, fetchOrganization } = useOrganization();

    const [formValues, setFormValues] = useState<ProfileFormValues>({
        firstName: "",
        lastName: "",
        avatarUrl: null,
    });

    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load current user data from organization context
    useEffect(() => {
        if (organization) {
            const nameParts = organization.userFullName.split(" ");
            setFormValues({
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                avatarUrl: organization.avatarUrl || null,
            });
        }
    }, [organization]);

    // Compute errors reactively based on current field values and touched state
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
        setTouched({ firstName: true, lastName: true });

        const firstNameValidation = validateFirstName(formValues.firstName);
        const lastNameValidation = validateLastName(formValues.lastName);

        return !firstNameValidation && !lastNameValidation;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (!validateForm()) {
            return;
        }

        const success = await updateMyProfile({
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            avatarUrl: formValues.avatarUrl,
        });

        if (success) {
            setSuccessMessage(resources.successMessage);
            // Refresh organization context to get updated user info
            await fetchOrganization();
            // Clear success message after a delay
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        }
    };

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!organization) return false;
        const nameParts = organization.userFullName.split(" ");
        const currentFirstName = nameParts[0] || "";
        const currentLastName = nameParts.slice(1).join(" ") || "";
        const currentAvatarUrl = organization.avatarUrl || null;

        return (
            formValues.firstName !== currentFirstName ||
            formValues.lastName !== currentLastName ||
            formValues.avatarUrl !== currentAvatarUrl
        );
    }, [formValues, organization]);

    return (
        <Paper p="md" withBorder>
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {successMessage && (
                        <Alert color="green" title={sharedNotifications.successTitle}>
                            {successMessage}
                        </Alert>
                    )}

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
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />

                    <Stack gap="xs">
                        <Group gap="md" align="flex-start">
                            <Avatar
                                src={formValues.avatarUrl}
                                size="lg"
                                radius="md"
                            >
                                {!formValues.avatarUrl &&
                                    `${formValues.firstName[0] || ""}${formValues.lastName[0] || ""}`.toUpperCase()}
                            </Avatar>
                            <TextInput
                                label={resources.form.avatarUrl}
                                placeholder="https://example.com/avatar.jpg"
                                style={{ flex: 1 }}
                                value={formValues.avatarUrl || ""}
                                onChange={(e) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        avatarUrl: e.target.value || null,
                                    }))
                                }
                                disabled={isLoading}
                            />
                        </Group>
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button
                            type="submit"
                            loading={isLoading}
                            disabled={!hasChanges}
                        >
                            {resources.buttons.save}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
