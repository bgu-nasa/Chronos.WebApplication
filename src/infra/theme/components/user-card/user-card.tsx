/** @author aaron-iz */
import { Avatar, Menu, Indicator } from "@mantine/core";
import { useNavigate } from "react-router";
import { $app, useOrganization } from "@/infra/service";
import { useLocalization } from "@/infra/service/localization";
import { SettingsIcon, LogoutIcon } from "@/common/icons";

export default function UserCard() {
    const navigate = useNavigate();
    const { organization } = useOrganization();
    const { t } = useLocalization();

    const handleLogout = () => {
        // Clear the authentication token
        $app.token.clearToken();

        // Clear organization state
        $app.organization.clearOrganization();

        // Navigate to login page
        navigate("/", { replace: true });
    };

    // Get user initials for avatar
    const getInitials = (fullName: string) => {
        const names = fullName.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const userFullName = organization?.userFullName || "User";
    const avatarUrl = organization?.avatarUrl;
    const initials = getInitials(userFullName);

    return (
        <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
                <Indicator
                    color="teal"
                    position="top-end"
                    size={10}
                    offset={4}
                    withBorder
                >
                    <Avatar
                        src={avatarUrl}
                        alt={userFullName}
                        radius="xl"
                        style={{ cursor: "pointer" }}
                    >
                        {!avatarUrl && initials}
                    </Avatar>
                </Indicator>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>{userFullName}</Menu.Label>
                <Menu.Divider />
                <Menu.Item
                    leftSection={<SettingsIcon size={16} />}
                    onClick={() => navigate("/auth/profile-settings")}
                >
                    {t("action.settings", undefined, "Settings")}
                </Menu.Item>
                <Menu.Item
                    leftSection={<LogoutIcon size={16} />}
                    onClick={handleLogout}
                    color="red"
                >
                    {t("action.logout", undefined, "Logout")}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
