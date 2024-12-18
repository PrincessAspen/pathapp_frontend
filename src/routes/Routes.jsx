import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';  // Now the landing page
// import Combat from './Combat';
import Inventory from './Inventory';
import Login, { action as loginAction } from './Login';
import MainPage from './MainPage';  // Now a dedicated character overview page
import Registration, { action as registrationAction } from './Registration';
import Combat from './Combat'
import Spellcasting from './Spellcasting'
// import Spellcasting from './Spellcasting';
import Layout from '../pages/Layout';
import ProtectedLayout from '../pages/ProtectedLayout';
import ErrorPage from '../pages/Error';
import CharacterCreationPage from './Creation';
import ShopPage from './Shop';

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
                    path: "/main/:characterId",
                    element: <MainPage />  // Dedicated character overview page
                },
                {
                    path: "/combat/:characterId",
                    element: <Combat />    // Combat statistics like AC, CMB, etc.
                },
                {
                    path: "/inventory/:characterId",
                    element: <Inventory /> // Equipment and money
                },
                {
                    path: "/spellcasting/:characterId",
                    element: <Spellcasting />  // Spellcasting page
                },
                {
                    path: "/shop",
                    element: <ShopPage /> // Shop Page
                },
                {
                    path: '/registration',
                    element: <Registration />,
                    action: registrationAction
                },
                {
                    path: '/login',
                    element: <Login />,
                    action: loginAction
                },
                {
                    path: '/creation',
                    element: <CharacterCreationPage />
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
