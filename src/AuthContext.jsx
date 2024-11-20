import { createContext, useState, useEffect, useContext } from 'react';
import supabase from './supabase'

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const updateSession = (access_token, user_id) => {
        setToken(access_token)
        setUser(user_id)
        sessionStorage.setItem('sb-access-token', access_token)
        sessionStorage.setItem('sb-user', user_id)
        setIsLoading(false);
    };

    const clearSession = () => {
        setToken(null);
        setUser(null);
        sessionStorage.removeItem('sb-access-token');  // Correctly remove the access token
        sessionStorage.removeItem('sb-user');  // Correctly remove the user id
    };

    const logout = async () => {
        const {error} = await supabase.auth.signOut();
        if (error) {
            console.error('ERROR', error);
        }
        return { error };
    }

    useEffect(() => {
        const { data: {subscription}
    } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('AUTH STATE CHANGE');
            if (session) {
                updateSession(session.access_token, session.user.id)
            }
            if (!session){
                setIsLoading(false);
            }
            if (!session && event === "SIGNED_OUT") {
                clearSession()
            }
        });
        return () => {
            subscription.unsubscribe();
        }
    }, [])

    return (
        <AuthContext.Provider value={{isLoading, user, token, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext)
}