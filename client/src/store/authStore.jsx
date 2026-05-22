import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const res = await authAPI.getMe();
            const bytes = CryptoJS.AES.decrypt(res.data.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return null;
            }
            const userData = JSON.parse(originalText);
            setUser(userData || null);
            return userData; // trả về để các hàm gọi có thể đọc role ngay
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (data) => {
        await authAPI.login(data);
        const userData = await fetchMe(); // fetchMe giờ return user
        return userData;                  // trả thẳng userData để LoginPage đọc role
    };

    const loginGoogle = async (token) => {
        const res = await authAPI.loginGoogle(token);
        await fetchMe();
        return res;
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser((prev) => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginGoogle, logout, updateUser, fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
