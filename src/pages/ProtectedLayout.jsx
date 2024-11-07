import {Outlet, NavLink, useNavigate, Navigate} from 'react-router-dom';
import { useAuth } from '../AuthContext'
import MainNav from "../components/MainNav";

const ProtectedLayout = () => {
    const {user, token, logout} = useAuth();

    if (!token && !user) {
        return <Navigate to='/login' replace />;
    };

    return (
        <>
          <MainNav />
          <main>
            <Outlet />
          </main>
        </>
      );
    }

export default ProtectedLayout;