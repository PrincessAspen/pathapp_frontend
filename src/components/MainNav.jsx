import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCharacter } from '../CharacterContext';
import logo from '../images/logo.webp';

const MainNav = () => {
    const { user, token, logout } = useAuth();
    const { character, userCharacters, resetCharacter } = useCharacter(); // Use resetCharacter here
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await logout();
        if (!error) {
            resetCharacter(); // Reset character data on logout
            navigate('/login');
        }
    };

    const characterExists = character && character.name && character.level > 0;

    return (
        <div>
            {/* Title Section with Larger Logo and Burgundy Gradient */}
            <h1 className="text-5xl font-extrabold text-center text-white bg-gradient-to-r from-red-700 to-red-500 mb-0">
                <img src={logo} alt="PathForger Logo" className="inline-block h-32 mr-6" />
                PathForger
            </h1>

            {/* Navigation Bar with a Blue and Burgundy Theme */}
            <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-10 mt-0">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-center flex-wrap">
                        {/* Navigation links */}
                        <ul className="flex flex-col md:flex-row md:justify-center space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
                            <li className="w-full md:w-auto">
                                <NavLink 
                                    to="/" 
                                    className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                    end
                                >
                                    Home
                                </NavLink>
                            </li>
                            {characterExists ? (
                                <>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to={`/main/${character.id}`} 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Character Overview
                                        </NavLink>
                                    </li>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to={`/combat/${character.id}`} 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Combat
                                        </NavLink>
                                    </li>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to={`/inventory/${character.id}`} 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Inventory
                                        </NavLink>
                                    </li>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to={`/spellcasting/${character.id}`} 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Spellcasting
                                        </NavLink>
                                    </li>
                                    <li className="w-full md:w-auto">
                                        <NavLink
                                            to="shop"
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Shop
                                        </NavLink>
                                    </li>
                
                                </>
                            ) : null}
                            {/* Character Creator link should always be visible when the user is logged in */}
                            {user && token && (
                                <li className="w-full md:w-auto">
                                    <NavLink 
                                        to="/creation" 
                                        className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                    >
                                        Character Creator
                                    </NavLink>
                                </li>
                            )}
                            {user && token ? (
                                <li className="w-full md:w-auto">
                                    <button 
                                        type="button" 
                                        onClick={handleLogout}
                                        className="block w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                    >
                                        Logout
                                    </button>
                                </li>
                            ) : (
                                <>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to="/registration" 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
                                        >
                                            Registration
                                        </NavLink>
                                    </li>
                                    <li className="w-full md:w-auto">
                                        <NavLink 
                                            to="/login" 
                                            className="block text-center py-2 px-4 bg-blue-700 hover:bg-blue-600 rounded-md text-white"
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
        </div>
    );
};

export default MainNav;
