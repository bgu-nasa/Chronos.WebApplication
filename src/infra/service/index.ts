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

// Notification service exports (panel UI lives under theme/components/notifications)
export {
    notificationService,
    NotificationProvider,
    useNotificationStore,
    type INotificationService,
    type NotificationOptions,
    type NotificationType,
} from "./notification";
export {
    NotificationPanelMenu,
    useNotificationPanelStore,
    type NotificationPanelEntry,
} from "@/infra/theme/components/notifications";
