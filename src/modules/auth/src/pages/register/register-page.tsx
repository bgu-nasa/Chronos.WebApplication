import {
    Button,
    Card,
    PasswordInput,
    Select,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PLANS, type PlanType } from "@/modules/auth/.mock/plans";
import { useRegister } from "@/modules/auth/src/hooks";
import {
    validateEmail,
    validateFirstName,
    validateLastName,
    validatePassword,
    validatePasswordMatch,
    validateOrganizationName,
} from "@/modules/auth/src/common/validation.service";
import styles from "./register-page.module.css";
import resourcesJson from "./register-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources("src/modules/auth/src/pages/register/register-page.resources.json", resourcesJson);

export function RegisterPage() {
    // User info
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Organization info
    const [inviteCode, setInviteCode] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [plan, setPlan] = useState<PlanType | null>(null);

    // Track which fields have been touched
    const [touched, setTouched] = useState({
        email: false,
        firstName: false,
        lastName: false,
        password: false,
        confirmPassword: false,
        inviteCode: false,
        organizationName: false,
    });

    const { register, isLoading, error: hookError } = useRegister();
    const [validationError, setValidationError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Compute errors reactively based on current field values
    const emailError = useMemo(() => {
        return touched.email ? validateEmail(email) : undefined;
    }, [email, touched.email]);

    const firstNameError = useMemo(() => {
        return touched.firstName ? validateFirstName(firstName) : undefined;
    }, [firstName, touched.firstName]);

    const lastNameError = useMemo(() => {
        return touched.lastName ? validateLastName(lastName) : undefined;
    }, [lastName, touched.lastName]);

    const passwordError = useMemo(() => {
        return touched.password ? validatePassword(password) : undefined;
    }, [password, touched.password]);

    const confirmPasswordError = useMemo(() => {
        return touched.confirmPassword
            ? validatePasswordMatch(password, confirmPassword)
            : undefined;
    }, [password, confirmPassword, touched.confirmPassword]);

    const organizationNameError = useMemo(() => {
        return touched.organizationName
            ? validateOrganizationName(organizationName)
            : undefined;
    }, [organizationName, touched.organizationName]);

    // Combine hook error and validation error
    const error = validationError || hookError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Mark all fields as touched for validation display
        setTouched({
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            confirmPassword: true,
            inviteCode: true,
            organizationName: true,
        });

        // Validate all fields
        const emailValidation = validateEmail(email);
        const firstNameValidation = validateFirstName(firstName);
        const lastNameValidation = validateLastName(lastName);
        const passwordValidation = validatePassword(password);
        const passwordMatchValidation = validatePasswordMatch(
            password,
            confirmPassword,
        );
        const organizationNameValidation =
            validateOrganizationName(organizationName);

        // Check for validation errors
        if (
            emailValidation ||
            firstNameValidation ||
            lastNameValidation ||
            passwordValidation ||
            passwordMatchValidation ||
            organizationNameValidation
        ) {
            return;
        }

        if (!plan) {
            setValidationError("Please select a plan");
            return;
        }

        try {
            const registerRequest = {
                AdminUser: {
                    Email: email,
                    FirstName: firstName,
                    LastName: lastName,
                    Password: password,
                },
                OrganizationName: organizationName,
                Plan: plan,
                InviteCode: inviteCode,
            };

            await register(registerRequest);
            // Navigate to dashboard home page after successful registration
            navigate("/dashboard/home");
        } catch (err) {
            // Error is already handled by the hook
            console.error("Registration error:", err);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <Card
                className={styles.registerCard}
                shadow="xl"
                padding="xl"
                radius="md"
            >
                <div className={styles.registerHeader}>
                    <Title order={2}>{resources.title}</Title>
                    <Text c="dimmed" size="sm">
                        {resources.subtitle}
                    </Text>
                </div>

                <form onSubmit={handleSubmit} className={styles.registerForm}>
                    {error && (
                        <Text c="red" size="sm">
                            {error}
                        </Text>
                    )}

                    <div className={styles.formSplit}>
                        {/* Left side - User Info */}
                        <div className={styles.formSection}>
                            <Title order={4} className={styles.sectionTitle}>
                                {resources.userInfoTitle}
                            </Title>

                            <TextInput
                                label={resources.emailLabel}
                                placeholder={resources.emailPlaceholder}
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        email: true,
                                    }))
                                }
                                error={emailError}
                                required
                                size="md"
                            />

                            <TextInput
                                label={resources.firstNameLabel}
                                placeholder={resources.firstNamePlaceholder}
                                value={firstName}
                                onChange={(e) =>
                                    setFirstName(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        firstName: true,
                                    }))
                                }
                                error={firstNameError}
                                required
                                size="md"
                            />

                            <TextInput
                                label={resources.lastNameLabel}
                                placeholder={resources.lastNamePlaceholder}
                                value={lastName}
                                onChange={(e) =>
                                    setLastName(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        lastName: true,
                                    }))
                                }
                                error={lastNameError}
                                required
                                size="md"
                            />

                            <PasswordInput
                                label={resources.passwordLabel}
                                placeholder={resources.passwordPlaceholder}
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        password: true,
                                    }))
                                }
                                error={passwordError}
                                required
                                size="md"
                            />

                            <PasswordInput
                                label={resources.confirmPasswordLabel}
                                placeholder={
                                    resources.confirmPasswordPlaceholder
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        confirmPassword: true,
                                    }))
                                }
                                error={confirmPasswordError}
                                required
                                size="md"
                            />
                        </div>

                        {/* Right side - Organization Info */}
                        <div className={styles.formSection}>
                            <Title order={4} className={styles.sectionTitle}>
                                {resources.orgInfoTitle}
                            </Title>

                            <TextInput
                                label="Invite Code"
                                placeholder="Enter your invite code"
                                value={inviteCode}
                                onChange={(e) =>
                                    setInviteCode(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        inviteCode: true,
                                    }))
                                }
                                required
                                size="md"
                            />

                            <TextInput
                                label={resources.orgNameLabel}
                                placeholder={resources.orgNamePlaceholder}
                                value={organizationName}
                                onChange={(e) =>
                                    setOrganizationName(e.currentTarget.value)
                                }
                                onBlur={() =>
                                    setTouched((prev) => ({
                                        ...prev,
                                        organizationName: true,
                                    }))
                                }
                                error={organizationNameError}
                                required
                                size="md"
                            />

                            <Select
                                label={resources.planLabel}
                                placeholder={resources.planPlaceholder}
                                value={plan}
                                onChange={(value) => setPlan(value as PlanType)}
                                data={PLANS.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                }))}
                                required
                                size="md"
                            />

                            {plan && (
                                <Card
                                    className={styles.planDescription}
                                    padding="md"
                                    radius="sm"
                                >
                                    <Text size="sm" c="dimmed">
                                        {
                                            PLANS.find((p) => p.id === plan)
                                                ?.description
                                        }
                                    </Text>
                                </Card>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        size="md"
                        loading={isLoading}
                        className={styles.registerButton}
                    >
                        {resources.registerButton}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
