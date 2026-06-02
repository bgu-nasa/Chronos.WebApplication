/**
 * Common utilities and components
 * Exports shared functionality across the application
 */

// Components
export { ConfirmationDialog } from "./components/confirmation-dialog";
export type { ConfirmationDialogProps } from "./components/confirmation-dialog";
export { CopiableInput } from "./components/copiable-input";
export { UserSelect } from "./components/user-select";
export type { User } from "./components/user-select";
export { DepartmentSelect } from "./components/department-select";
export type { Department } from "./components/department-select";
export { UserInfo } from "./components/user-info";
export { ChronosLogo } from "./components/chronos-logo";

// Hooks
export { useConfirmation } from "./hooks/use-confirmation";
export type {
    ConfirmationState,
    UseConfirmationReturn,
} from "./hooks/use-confirmation";

// Weekdays (English values for API; translated labels for UI)
export {
    Weekday,
    WeekdayOrder,
    ENGLISH_WEEKDAY_ORDER,
    getWeekdayLabel,
    getWeekdayShortLabel,
    getEnglishWeekdayName,
    getWeekdayLabelFromDate,
    getWeekdaySelectOptions,
    weekdayNamesMatch,
    formatPreferredWeekdaysDisplay,
} from "./weekdays";

// Icons
export { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    MenuIcon,
    ResourcesIcon,
    CoursesIcon,
    ResourceManagementIcon,
} from "./icons";
