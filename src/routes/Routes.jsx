import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';  // Now the landing page
// import Combat from './Combat';
import Inventory from './Inventory';
import Login, { action as loginAction } from './Login';
import MainPage from './MainPage';  // Now a dedicated character overview page
import Registration, { action as registrationAction } from './Registration';
// import Spellcasting from './Spellcasting';
import Layout from '../pages/Layout';
import ProtectedLayout from '../pages/ProtectedLayout';
import ErrorPage from '../pages/Error';

const Routes = () => {
    const publicRoutes = [
        {
            element: <Layout />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "/",
                    element: <Home />  // Set Home as the main landing page
                },
                {
                    path: "/main",
                    element: <MainPage />  // Dedicated character overview page
                },
                // {
                //     path: "/combat",
                //     element: <Combat />    // Combat statistics like AC, CMB, etc.
                // },
                {
                    path: "/inventory",
                    element: <Inventory /> // Equipment and money
                },
                // {
                //     path: "/spellcasting",
                //     element: <Spellcasting />  // Spellcasting page
                // },
                {
                    path: '/registration',
                    element: <Registration />,
                    action: registrationAction
                },
                {
                    path: '/login',
                    element: <Login />,
                    action: loginAction
                }
            ]
        }
    ];

    const protectedRoutes = [
        {
            element: <ProtectedLayout />,
            children: [
                // Add any routes here that require authentication
            ]
        }
    ];

    const router = createBrowserRouter([...publicRoutes, ...protectedRoutes]);

    return <RouterProvider router={router} />;
};

export default Routes;
