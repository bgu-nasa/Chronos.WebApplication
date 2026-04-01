/** @author aaron-iz */
import { Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { $app } from "@/infra/service";
import { useLocalization } from "@/infra/service/localization";

export default function LogoutButton() {
    const navigate = useNavigate();
    const { t } = useLocalization();

    const handleLogout = () => {
        // Clear the authentication token
        $app.token.clearToken();

        // Clear organization state
        $app.organization.clearOrganization();

        // Navigate to login page
        navigate("/", { replace: true });
    };

    return (
        <Button variant="subtle" onClick={handleLogout}>
            {t("action.logout", undefined, "Logout")}
        </Button>
    );
}
