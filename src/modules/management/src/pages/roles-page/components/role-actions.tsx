import { Button } from "@mantine/core";
import resourcesJson from "@/modules/management/src/pages/roles-page/roles-page.resources.json";
import { translatedResources } from "@/infra/i18n";

const resources = translatedResources(
    "src/modules/management/src/pages/roles-page/roles-page.resources.json",
    resourcesJson,
);
interface RoleActionsProps {
    onCreateClick: () => void;
}

export function RoleActions({ onCreateClick }: RoleActionsProps) {
    return (
        <Button.Group mb="md">
            <Button onClick={onCreateClick}>{resources.createButton}</Button>
        </Button.Group>
    );
}
