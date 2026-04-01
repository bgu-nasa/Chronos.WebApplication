import type { SupportedLocale } from "./localization.types";

type TranslationMap = Record<string, string>;

const en: TranslationMap = {
    "localization.switch.en": "Switch language to English",
    "localization.switch.he": "Switch language to Hebrew",

    // Common actions
    "action.settings": "Settings",
    "action.logout": "Logout",

    // Navigation labels
    "navigation.label.login": "Login",
    "navigation.label.users": "Users",
    "navigation.label.home": "Home",
    "navigation.label.resources": "Resources",
    "navigation.label.courses": "Courses",
    "navigation.label.rooms": "Rooms",
    "navigation.label.management": "Management",
    "navigation.label.departments": "Departments",
    "navigation.label.accessControl": "Access Control",
    "navigation.label.organizationSettings": "Organization Settings",
    "navigation.label.schedule": "Schedule",
    "navigation.label.calendar": "Calendar",
    "navigation.label.semesters": "Semesters",
    "navigation.label.constraints": "Constraints",

    // Auth validation
    "validation.email.required": "Email is required",
    "validation.email.invalid": "Invalid email format",
    "validation.password.required": "Password is required",
    "validation.password.min": "Password must be at least 8 characters long",
    "validation.password.max": "Password must not exceed 128 characters",
    "validation.password.whitespace": "Password cannot contain whitespace",
    "validation.password.complexity": "Password must contain uppercase, lowercase, and digit",
    "validation.password.match": "Passwords do not match",
    "validation.organization.required": "Organization name is required",
    "validation.organization.min": "Organization name must be at least 3 characters",
    "validation.organization.max": "Organization name must not exceed 64 characters",
    "validation.organization.whitespace": "Organization name cannot start or end with whitespace",
    "validation.organization.pattern": "Organization name must contain only letters, numbers, hyphens, underscores, and spaces",
    "validation.organization.reserved": "This organization name is reserved and cannot be used",
    "validation.firstName.required": "First name is required",
    "validation.firstName.min": "First name must be at least 2 characters",
    "validation.lastName.required": "Last name is required",
    "validation.lastName.min": "Last name must be at least 2 characters",
    "validation.required": "{fieldName} is required",

    // User store
    "notifications.user.loading.create": "Creating user...",
    "notifications.user.loading.update": "Updating user...",
    "notifications.user.loading.updateProfile": "Updating profile...",
    "notifications.user.loading.delete": "Deleting user...",
    "notifications.user.success.create": "User created successfully",
    "notifications.user.success.update": "User updated successfully",
    "notifications.user.success.updateProfile": "Profile updated successfully",
    "notifications.user.success.delete": "User deleted successfully",
    "notifications.user.error.fetch": "Failed to fetch users",
    "notifications.user.error.create": "Failed to create user",
    "notifications.user.error.update": "Failed to update user",
    "notifications.user.error.updateProfile": "Failed to update profile",
    "notifications.user.error.delete": "Failed to delete user",

    // Department store
    "notifications.department.loading.create": "Creating department...",
    "notifications.department.loading.update": "Updating department...",
    "notifications.department.loading.delete": "Deleting department...",
    "notifications.department.loading.restore": "Restoring department...",
    "notifications.department.success.create": "Department created successfully",
    "notifications.department.success.update": "Department updated successfully",
    "notifications.department.success.delete": "Department deleted successfully",
    "notifications.department.success.restore": "Department restored successfully",
    "notifications.department.error.fetch": "Failed to fetch departments",
    "notifications.department.error.create": "Failed to create department",
    "notifications.department.error.update": "Failed to update department",
    "notifications.department.error.delete": "Failed to delete department",
    "notifications.department.error.restore": "Failed to restore department",

    // Role store
    "notifications.role.loading.create": "Creating role assignment...",
    "notifications.role.loading.remove": "Removing role assignment...",
    "notifications.role.success.create": "Role assignment created successfully",
    "notifications.role.success.remove": "Role assignment removed successfully",
    "notifications.role.error.fetch": "Failed to fetch role assignments",
    "notifications.role.error.create": "Failed to create role assignment",
    "notifications.role.error.remove": "Failed to remove role assignment",
};

const he: TranslationMap = {
    "localization.switch.en": "החלף שפה לאנגלית",
    "localization.switch.he": "החלף שפה לעברית",

    // Common actions
    "action.settings": "הגדרות",
    "action.logout": "התנתקות",

    // Navigation labels
    "navigation.label.login": "התחברות",
    "navigation.label.users": "משתמשים",
    "navigation.label.home": "בית",
    "navigation.label.resources": "משאבים",
    "navigation.label.courses": "קורסים",
    "navigation.label.rooms": "חדרים",
    "navigation.label.management": "ניהול",
    "navigation.label.departments": "מחלקות",
    "navigation.label.accessControl": "ניהול הרשאות",
    "navigation.label.organizationSettings": "הגדרות ארגון",
    "navigation.label.schedule": "שיבוץ",
    "navigation.label.calendar": "לוח שנה",
    "navigation.label.semesters": "סמסטרים",
    "navigation.label.constraints": "אילוצים",

    // Auth validation
    "validation.email.required": "נדרש להזין דואר אלקטרוני",
    "validation.email.invalid": "פורמט דואר אלקטרוני לא תקין",
    "validation.password.required": "נדרש להזין סיסמה",
    "validation.password.min": "הסיסמה חייבת לכלול לפחות 8 תווים",
    "validation.password.max": "הסיסמה לא יכולה לחרוג מ-128 תווים",
    "validation.password.whitespace": "הסיסמה לא יכולה לכלול רווחים",
    "validation.password.complexity": "הסיסמה חייבת לכלול אות גדולה, אות קטנה וספרה",
    "validation.password.match": "הסיסמאות אינן תואמות",
    "validation.organization.required": "נדרש להזין שם ארגון",
    "validation.organization.min": "שם הארגון חייב לכלול לפחות 3 תווים",
    "validation.organization.max": "שם הארגון לא יכול לחרוג מ-64 תווים",
    "validation.organization.whitespace": "שם הארגון לא יכול להתחיל או להסתיים ברווח",
    "validation.organization.pattern": "שם הארגון יכול לכלול רק אותיות, מספרים, מקפים, קווים תחתונים ורווחים",
    "validation.organization.reserved": "שם הארגון הזה שמור ואי אפשר להשתמש בו",
    "validation.firstName.required": "נדרש להזין שם פרטי",
    "validation.firstName.min": "השם הפרטי חייב לכלול לפחות 2 תווים",
    "validation.lastName.required": "נדרש להזין שם משפחה",
    "validation.lastName.min": "שם המשפחה חייב לכלול לפחות 2 תווים",
    "validation.required": "נדרש להזין {fieldName}",

    // User store
    "notifications.user.loading.create": "יוצר משתמש...",
    "notifications.user.loading.update": "מעדכן משתמש...",
    "notifications.user.loading.updateProfile": "מעדכן פרופיל...",
    "notifications.user.loading.delete": "מוחק משתמש...",
    "notifications.user.success.create": "המשתמש נוצר בהצלחה",
    "notifications.user.success.update": "המשתמש עודכן בהצלחה",
    "notifications.user.success.updateProfile": "הפרופיל עודכן בהצלחה",
    "notifications.user.success.delete": "המשתמש נמחק בהצלחה",
    "notifications.user.error.fetch": "טעינה של משתמשים נכשלה",
    "notifications.user.error.create": "יצירת משתמש נכשלה",
    "notifications.user.error.update": "עדכון משתמש נכשל",
    "notifications.user.error.updateProfile": "עדכון פרופיל נכשל",
    "notifications.user.error.delete": "מחיקת משתמש נכשלה",

    // Department store
    "notifications.department.loading.create": "יוצר מחלקה...",
    "notifications.department.loading.update": "מעדכן מחלקה...",
    "notifications.department.loading.delete": "מוחק מחלקה...",
    "notifications.department.loading.restore": "משחזר מחלקה...",
    "notifications.department.success.create": "המחלקה נוצרה בהצלחה",
    "notifications.department.success.update": "המחלקה עודכנה בהצלחה",
    "notifications.department.success.delete": "המחלקה נמחקה בהצלחה",
    "notifications.department.success.restore": "המחלקה שוחזרה בהצלחה",
    "notifications.department.error.fetch": "טעינת מחלקות נכשלה",
    "notifications.department.error.create": "יצירת מחלקה נכשלה",
    "notifications.department.error.update": "עדכון מחלקה נכשל",
    "notifications.department.error.delete": "מחיקת מחלקה נכשלה",
    "notifications.department.error.restore": "שחזור מחלקה נכשל",

    // Role store
    "notifications.role.loading.create": "יוצר שיוך תפקיד...",
    "notifications.role.loading.remove": "מסיר שיוך תפקיד...",
    "notifications.role.success.create": "שיוך התפקיד נוצר בהצלחה",
    "notifications.role.success.remove": "שיוך התפקיד הוסר בהצלחה",
    "notifications.role.error.fetch": "טעינת שיוכי תפקיד נכשלה",
    "notifications.role.error.create": "יצירת שיוך תפקיד נכשלה",
    "notifications.role.error.remove": "הסרת שיוך תפקיד נכשלה",
};

export const TRANSLATIONS: Record<SupportedLocale, TranslationMap> = {
    en,
    he,
};
