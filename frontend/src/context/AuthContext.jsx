import { createContext, useContext, useEffect, useState } from 'react';
import { api, fetchCsrfToken } from '../services/api.js';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function register(name, email, password) {
        try {
            await api.post('/auth/register', { name, email, password });
        }
        catch (err) {
            throw err;
        }
    }

    async function login(email, password) {
        try {
            await api.post('/auth/login', { email, password });
            await fetchCsrfToken();
            const meResponse = await api.get('/auth/me');
            setUser(meResponse.data);
        }
        catch (err) {
            setUser(null);
            throw err;
        }
    }

    async function logout() {
        try {
            await api.post('/auth/logout');
        }
        catch (err) {
            // Empty
        }
        finally {
            setUser(null);
            await fetchCsrfToken();
        }
    }

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            }
            catch (err) {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };