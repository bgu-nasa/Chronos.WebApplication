/** @author aaron-iz */
import { Route, Routes } from "react-router";
import { ApplicationRoutesRepository } from "./federation";
import {
    AuthenticatedPageFilter,
    UnauthenticatedPageFilter,
    DashboardLayout,
    PublicLayout,
} from "./theme";
import { NotificationProvider } from "./service";

function App() {
    const publicRoutes = ApplicationRoutesRepository.getPublicRoutes();
    const privateRoutes = ApplicationRoutesRepository.getAuthenticatedRoutes();

    const getRouteKey = (route: any, index: number) => {
        return `${route.name}-r${index}`;
    };

    return (
        <>
            <Routes>
                <Route element={<UnauthenticatedPageFilter />}>
                    <Route element={<PublicLayout />}>
                        {publicRoutes.map((route, index) => (
                            <Route
                                key={getRouteKey(route, index)}
                                path={route.path}
                                element={route.element}
                            />
                        ))}
                    </Route>
                </Route>

                <Route element={<AuthenticatedPageFilter />}>
                    <Route element={<DashboardLayout />}>
                        {privateRoutes.map((route, index) => (
                            <Route
                                key={getRouteKey(route, index)}
                                path={route.path}
                                element={route.element}
                            />
                        ))}
                    </Route>
                </Route>
            </Routes>

            <NotificationProvider />
        </>
    );
}

export default App;
