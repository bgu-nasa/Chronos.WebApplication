/** @author aaron-iz */
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { $app } from "@/infra/service";
import { SchedulingHubConnector } from "@/infra/theme/components/notifications";

const LoginPageRoute = "/";

/**
 * Higher-order component that requires authentication
 * Redirects to login page if user is not authenticated
 */
export default function AuthenticatedPageFilter() {
    const navigate = useNavigate();
    const isAuthenticated = $app.isAuthenticated();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(LoginPageRoute, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <SchedulingHubConnector />
            <Outlet />
        </>
    );
}
