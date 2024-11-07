import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const MainNav = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await logout();
        if (!error) {
            return navigate('/login');
        }
    };

    return (
        <nav>
            <ul>
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/main">Character Overview</NavLink>
                </li>
                <li>
                    <NavLink to="/combat">Combat</NavLink>
                </li>
                <li>
                    <NavLink to="/inventory">Inventory</NavLink>
                </li>
                <li>
                    <NavLink to="/spellcasting">Spellcasting</NavLink>
                </li>
                {user && token ? (
                    <li>
                        <button type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                ) : (
                    <>
                        <li>
                            <NavLink to="/registration">Registration</NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">Log in</NavLink>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default MainNav;
