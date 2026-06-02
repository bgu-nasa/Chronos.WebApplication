/** @author aaron-iz */
import { Alert } from "@mantine/core";
import { AlertTriangleIcon } from "@/common/icons";
import { $app } from "@/infra/service";
import deletedOrganizationAlertResourcesJson from "./deleted-organization-alert.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/infra/theme/layouts/dashboard-layout/deleted-organization-alert.resources.json",
    deletedOrganizationAlertResourcesJson,
);

/**
 * Alert component that displays a warning when the organization is marked for deletion
 * Uses $app.organization to access organization information
 */
export function DeletedOrganizationAlert() {
    const orgInfo = $app.organization.getOrganization();

    // Don't show alert if organization is not deleted
    if (!orgInfo?.deleted) {
        return null;
    }

    // Parse the deleted date and calculate the final deletion date (90 days later)
    const deletedDate = new Date(orgInfo.deletedTime);
    const finalDeletionDate = new Date(deletedDate);
    finalDeletionDate.setDate(finalDeletionDate.getDate() + 90);

    // Format dates for display
    const deletedDateStr = deletedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const finalDeletionDateStr = finalDeletionDate.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );

    // Replace placeholders in the message
    const message = resources.message
        .replace("{finalDeletionDate}", finalDeletionDateStr)
        .replace("{deletedDate}", deletedDateStr);

    return (
        <Alert
            variant="filled"
            color="red"
            title={resources.title}
            icon={<AlertTriangleIcon size={20} />}
            mb="md"
        >
            {message}
        </Alert>
    );
}
