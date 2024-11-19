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
        <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo or Title */}
                    <div className="text-2xl font-bold">
                        <NavLink to="/" className="text-white hover:text-indigo-200">
                            Character Manager
                        </NavLink>
                    </div>
                    {/* Navigation links */}
                    <ul className="flex space-x-6">
                        <li>
                            <NavLink 
                                to="/" 
                                className="text-white hover:text-indigo-200 active:text-indigo-300"
                                end
                            >
                                Home
                            </NavLink>
                        </li>
                        {characterExists ? (
                            <>
                                <li>
                                    <NavLink 
                                        to={`/main/${character.id}`} 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Character Overview
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to={`/combat/${character.id}`} 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Combat
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to={`/inventory/${character.id}`} 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Inventory
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to={`/spellcasting/${character.id}`} 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Spellcasting
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <li>
                                <NavLink 
                                    to="/creation" 
                                    className="text-white hover:text-indigo-200 active:text-indigo-300"
                                >
                                    Character Creator
                                </NavLink>
                            </li>
                        )}
                        {user && token ? (
                            <li>
                                <button 
                                    type="button" 
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md focus:outline-none"
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <NavLink 
                                        to="/registration" 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Registration
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/login" 
                                        className="text-white hover:text-indigo-200 active:text-indigo-300"
                                    >
                                        Log in
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default MainNav;
