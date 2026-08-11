import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function register(name, email, password) {
        await api.post('/auth/register', { name, email, password });
    }

    async function login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        const meResponse = await api.get('/auth/me');
        setUser(meResponse.data);
    }

    async function logout() {
        localStorage.removeItem('token');
        setUser(null);
    }

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            }
            catch (err) {
                localStorage.removeItem('token');
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