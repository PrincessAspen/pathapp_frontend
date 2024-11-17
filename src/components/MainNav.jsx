import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCharacter } from '../CharacterContext';

const MainNav = () => {
    const { user, token, logout } = useAuth();
    const { character, userCharacters } = useCharacter();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await logout();
        if (!error) {
            navigate('/login');
        }
    };

    const characterExists = character && character.name && character.level > 0;

    return (
        <nav>
            <ul>
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>
                {characterExists ? (
                    <>
                        {/* Update the paths to use character.id */}
                        <li>
                            <NavLink to={`/main/${character.id}`}>Character Overview</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/combat/${character.id}`}>Combat</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/inventory/${character.id}`}>Inventory</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/spellcasting/${character.id}`}>Spellcasting</NavLink>
                        </li>
                    </>
                ) : (
                    <li>
                        <NavLink to="/creation">Character Creator</NavLink>
                    </li>
                )}
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
