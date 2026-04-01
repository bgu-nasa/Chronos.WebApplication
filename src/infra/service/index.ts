/**
 * Infrastructure service layer exports
 * Public API for the $app singleton and related types
 */

export { $app } from "./app";
export type {
    IAjaxService,
    AjaxRequestConfig,
    ApiError,
    StoredToken,
} from "./ajax/types";
export { tokenService } from "./ajax/token.service";

// Organization service exports
export {
    organizationService,
    useOrganization,
    useOrganizationStore,
    RoleType,
    type IOrganizationService,
    type OrganizationInformation,
    type RoleAssignmentResponse,
    type DepartmentResponse,
} from "./organization";

// Logger service exports
export {
    loggerService,
    type ILogger,
    type LogLevel,
    type LogEntry,
} from "./logger";

// Notification service exports
export {
    notificationService,
    NotificationProvider,
    type INotificationService,
    type NotificationOptions,
    type NotificationType,
} from "./notification";

// Localization service exports
export {
    localizationService,
    LocalizationProvider,
    useLocalization,
    useLocalizationStore,
    type ILocalizationService,
    type LocalizationDirection,
    type SupportedLocale,
    type TranslationParams,
} from "./localization";
