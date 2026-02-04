import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { ApiClient, ApiRequestError, TokenManager, UserManager } from '../../lib/api-client';

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USE_MOCK_AUTH = false; // Set to false when backend is ready

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize: Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = UserManager.getUser();
                const { token } = TokenManager.getTokens();

                if (savedUser && token) {
                    // Verify token is still valid
                    if (!TokenManager.isTokenExpired(token)) {
                        setUser(savedUser);
                    } else {
                        // Token expired, try to refresh
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            // Clear invalid session
                            TokenManager.clearTokens();
                            UserManager.clearUser();
                        }
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                // Clear corrupted session
                TokenManager.clearTokens();
                UserManager.clearUser();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Refresh token function (exported for use by API client)
    const refreshToken = async (): Promise<boolean> => {
        if (USE_MOCK_AUTH) {
            return true; // Mock always succeeds
        }

        try {
            const { refreshToken: storedRefreshToken } = TokenManager.getTokens();
            if (!storedRefreshToken) return false;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: storedRefreshToken })
            });

            if (!response.ok) {
                return false;
            }

            const data: AuthResponse = await response.json();
            TokenManager.setTokens(data.access_token, data.refresh_token);
            UserManager.setUser(data.user);
            setUser(data.user);

            return true;
        } catch (err) {
            console.error('Token refresh failed:', err);
            return false;
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setError(null);
        setIsLoading(true);

        try {
            if (USE_MOCK_AUTH) {
                // Mock login
                await new Promise(resolve => setTimeout(resolve, 800));

                // Simple mock authentication - accept any email
                const role: Role = 'Project Manager'; // Could be determined by email domain
                const mockUser: User = {
                    id: `u${Date.now()}`,
                    name: credentials.email.split('@')[0].charAt(0).toUpperCase() + credentials.email.split('@')[0].slice(1),
                    email: credentials.email,
                    role,
                    avatar: credentials.email.charAt(0).toUpperCase()
                };

                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();

                TokenManager.setTokens(mockToken, mockRefreshToken);
                UserManager.setUser(mockUser);
                setUser(mockUser);
            } else {
                // Real API login
                const response = await ApiClient.post<AuthResponse>(
                    '/auth/login',
                    credentials,
                    undefined,
                    { skipAuth: true } // Don't send auth token for login
                );

                TokenManager.setTokens(response.access_token, response.refresh_token);
                UserManager.setUser(response.user);
                setUser(response.user);
            }
        } catch (err) {
            const message = err instanceof ApiRequestError
                ? err.message
                : 'Login failed. Please try again.';
            setError(message);
            throw err; // Re-throw so caller can handle
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        TokenManager.clearTokens();
        UserManager.clearUser();
        setUser(null);
        setError(null);
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading,
                error,
                clearError,
                refreshToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
/* eslint-enable react-refresh/only-export-components */
