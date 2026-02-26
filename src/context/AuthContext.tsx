// context/AuthContext.tsx
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const getToken = () => sessionStorage.getItem("token");
const setToken = (t: string) => sessionStorage.setItem("token", t);
const clearToken = () => sessionStorage.removeItem("token");

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // true on mount — checking existing session

    // ── Check if already logged in on mount ──────────────────────────────────
    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken(); // ← reads from sessionStorage
            if (!token) { setLoading(false); return; }

            try {
                const res = await fetch(`${API}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(mapUser(data.user));
                } else {
                    clearToken();
                }
            } catch (err) {
                clearToken();
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const mapUser = (data: any) => ({
        id: data.id,
        email: data.email,
        // ← handle every possible field name your backend might send
        name: data.displayName || data.name || data.username || data.email,
        avatar: data.avatar || null,
    });
    // ── Login ─────────────────────────────────────────────────────────────────
    const login = async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("FULL RESPONSE:", data);        // ← check this
        console.log("USER OBJECT:", data.user);     // ← check this
        console.log("DISPLAY NAME:", data.user?.displayName);
        if (!res.ok) throw new Error(data.error || "Login failed.");
        console.log("[AuthContext] Login successful:", data);
        queryClient.clear(); // Clear all cached data on login
        setToken(data.token);
        setUser(mapUser(data.user)); // ← handle both { user: {...} } and direct user object
    };

    // ── Register ──────────────────────────────────────────────────────────────
    const register = async (email: string, password: string, displayName: string) => {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, displayName }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed.");
        setToken(data.token);
        queryClient.clear(); // Clear all cached data on login
        setUser(mapUser(data.user)); // ← handle both { user: {...} } and direct user object
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = async () => {
        await fetch(`${API}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        queryClient.clear(); // Clear all cached data
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}