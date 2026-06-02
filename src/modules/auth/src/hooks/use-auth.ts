/**
 * Auth hooks
 * React hooks for authentication operations
 */

import { useState } from "react";
import { authDataRepository } from "@/modules/auth/src/data/auth-data-repository";
import type { PasswordUpdateRequest } from "@/modules/auth/src/data/auth.types";
import type { ApiError } from "@/infra/service/ajax/types";
import { translatedResources } from "@/infra/i18n";
import notificationResourcesJson from "@/infra/service/notification/notification.resources.json";

const notificationResources = translatedResources(
    "src/infra/service/notification/notification.resources.json",
    notificationResourcesJson,
);
import resourcesJson from "./use-auth.resources.json";

const resources = translatedResources(
    "src/modules/auth/src/hooks/use-auth.resources.json",
    resourcesJson,
);

export function useUpdatePassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePassword = async (
        request: PasswordUpdateRequest,
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        const loadingNotification = $app.notifications.showLoading(
            resources.notifications.updating,
        );
        try {
            await authDataRepository.updatePassword(request);
            setIsLoading(false);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showSuccess(
                notificationResources.successTitle,
                resources.notifications.updateSuccess,
            );
            return true;
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage =
                apiError.message || resources.notifications.updateError;
            setError(errorMessage);
            setIsLoading(false);
            $app.logger.error("Error updating password:", err);
            $app.notifications.remove(loadingNotification);
            $app.notifications.showError(
                notificationResources.errorTitle,
                apiError.details
                    ? String(apiError.details)
                    : resources.notifications.updateError,
            );
            return false;
        }
    };

    return {
        updatePassword,
        isLoading,
        error,
    };
}
