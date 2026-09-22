import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../src/firebase';

export const WORKSPACE_SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/presentations.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
];

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    accessToken: string | null;
    signIn: () => Promise<string | null>;
    logOut: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
}

// In-memory token cache (never stored in localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    accessToken: null,
    signIn: async () => null,
    logOut: async () => {},
    getAccessToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Jaakko's email is the designated portfolio owner / admin
    const adminEmail = 'jaakko.kkallio@gmail.com';
    const isAdmin = user?.email === adminEmail;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                cachedAccessToken = null;
                setToken(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (): Promise<string | null> => {
        const provider = new GoogleAuthProvider();
        WORKSPACE_SCOPES.forEach(scope => {
            provider.addScope(scope);
        });
        provider.setCustomParameters({
            prompt: 'consent',
            access_type: 'offline',
        });

        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                cachedAccessToken = credential.accessToken;
                setToken(credential.accessToken);
                return credential.accessToken;
            }
            return null;
        } catch (error) {
            console.error("Error signing in with Google Workspace scopes:", error);
            throw error;
        }
    };

    const getAccessToken = async (): Promise<string | null> => {
        if (cachedAccessToken) return cachedAccessToken;
        return null;
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            cachedAccessToken = null;
            setToken(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, accessToken: token, signIn, logOut, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};
