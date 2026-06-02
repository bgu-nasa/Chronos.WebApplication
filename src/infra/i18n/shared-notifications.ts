import { translatedResources } from "@/infra/i18n";
import sharedNotificationsResourcesJson from "./shared-notifications.resources.json";

const resources = translatedResources(
    "src/infra/i18n/shared-notifications.resources.json",
    sharedNotificationsResourcesJson,
);

export const sharedNotifications = {
    successTitle: resources.successTitle,
    errorTitle: resources.errorTitle,
    warningTitle: resources.warningTitle,
    validationTitle: resources.validationTitle,
};
