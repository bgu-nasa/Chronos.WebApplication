import {
    Button,
    Card,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/modules/auth/src/hooks";
import {
    validateEmail,
    validatePassword,
} from "@/modules/auth/src/common/validation.service";
import styles from "./login-page.module.css";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });
    const { login, isLoading, error } = useLogin();
    const navigate = useNavigate();
    const { t } = useTranslation("auth.login.login-page");

    // Compute errors reactively based on current field values
    const emailError = useMemo(() => {
        return touched.email ? validateEmail(email) : undefined;
    }, [email, touched.email]);

    const passwordError = useMemo(() => {
        return touched.password ? validatePassword(password) : undefined;
    }, [password, touched.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched for validation display
        setTouched({ email: true, password: true });

        // Check for validation errors
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        if (emailValidation || passwordValidation) {
            return;
        }

        try {
            await login(email, password);
            // Navigate to dashboard home page after successful login
            navigate("/dashboard/home");
        } catch (err) {
            // Error is already handled by the hook
            console.error("Login error:", err);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <Card
                className={styles.loginCard}
                shadow="xl"
                padding="xl"
                radius="md"
            >
                <div className={styles.loginHeader}>
                    <Title order={2}>{t("title")}</Title>
                    <Text c="dimmed" size="sm">
                        {t("subtitle")}
                    </Text>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                        <Text c="red" size="sm">
                            {error}
                        </Text>
                    )}

                    <TextInput
                        label={t("emailLabel")}
                        placeholder={t("emailPlaceholder")}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        onBlur={() =>
                            setTouched((prev) => ({ ...prev, email: true }))
                        }
                        error={emailError}
                        required
                        size="md"
                    />

                    <PasswordInput
                        label={t("passwordLabel")}
                        placeholder={t("passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        onBlur={() =>
                            setTouched((prev) => ({ ...prev, password: true }))
                        }
                        error={passwordError}
                        required
                        size="md"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="md"
                        loading={isLoading}
                        className={styles.loginButton}
                    >
                        {t("loginButton")}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
