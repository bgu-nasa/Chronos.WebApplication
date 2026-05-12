/**
 * Global $app singleton
 * Central access point for cross-cutting application services
 */

import { ajaxService } from "./ajax/ajax.service";
import { tokenService } from "./ajax/token.service";
import { organizationService } from "./organization/organization.service";
import {
    loggerService,
    setOrganizationIdGetter,
} from "./logger/logger.service";
import { notificationService } from "./notification/notification.service";
import type { IAjaxService } from "./ajax/types";
import type { IOrganizationService } from "./organization/organization.service";
import type { ILogger } from "./logger/logger.types";
import type { INotificationService } from "./notification/notification.types";

/**
 * Application service container interface
 * Designed for extensibility - future services can be added here
 */
interface IApp {
    /**
     * HTTP client for authenticated and unauthenticated requests
     */
    ajax: IAjaxService;

    /**
     * Token management service
     * Handles authentication token storage, retrieval, and lifecycle
     */
    token: typeof tokenService;

    /**
     * Organization information service
     * Manages organization context, roles, and departments
     */
    organization: IOrganizationService;

    /**
     * Custom logger service
     * Collects logs in a queue and periodically sends them to Discord
     * Use this instead of console.log/error/warn/info
     */
    logger: ILogger;

    /**
     * Notification service
     * Toasts bottom-right; same events are listed in the dashboard notification panel (history).
     */
    notifications: INotificationService;

    /**
     * Check if user is authenticated (has a valid token)
     * @returns true if token exists, false otherwise
     */
    isAuthenticated: () => boolean;

    // Future services can be added here:
    // auth: IAuthService;
    // storage: IStorageService;
}

/**
 * Global application singleton
 * Provides centralized access to all application services
 *
 * Usage:
 * ```ts
 * import { $app } from '@/infra/service';
 *
 * // Check authentication
 * if ($app.isAuthenticated()) {
 *   $app.logger.info('User is authenticated');
 * }
 *
 * // Logging
 * $app.logger.info('User logged in', { userId: user.id });
 * $app.logger.error('Failed to load data', error);
 * $app.logger.warn('Deprecated feature used');
 *
 * // Authenticated request
 * const user = await $app.ajax.get<User>('/users/me');
 *
 * // Unauthenticated request
 * const response = await $app.ajax.post<LoginResponse>(
 *   '/auth/login',
 *   { email, password },
 *   { auth: false }
 * );
 * ```
 */
export const $app: IApp = {
    ajax: ajaxService,
    token: tokenService,
    organization: organizationService,
    logger: loggerService,
    notifications: notificationService,
    isAuthenticated: () => tokenService.hasToken(),
};

// Make $app globally accessible on window for debugging and console access
if (typeof window !== "undefined") {
    (window as any).$app = $app;
}

// Configure logger to access organization ID
setOrganizationIdGetter(() => {
    try {
        const orgInfo = organizationService.getOrganization();
        return orgInfo?.id || null;
    } catch {
        return null;
    }
});
