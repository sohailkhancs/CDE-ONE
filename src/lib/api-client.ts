// Storage keys
const STORAGE_KEY = 'cde_one_user';
const TOKEN_KEY = 'cde_one_token';
const REFRESH_TOKEN_KEY = 'cde_one_refresh_token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: unknown;
    token?: string;
    retries?: number;
    skipAuth?: boolean;
}

interface ApiError {
    detail: string;
    code?: string;
    status: number;
}

// Custom error class for API errors
export class ApiRequestError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.code = code;
    }
}

// Token management utilities
export const TokenManager = {
    getTokens: () => ({
        token: localStorage.getItem(TOKEN_KEY),
        refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
    }),

    setTokens: (token: string, refreshToken?: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    clearTokens: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
    },

    // Check if token is expired (simple JWT check)
    isTokenExpired: (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }
};

// User data management
export const UserManager = {
    getUser: () => {
        const userStr = localStorage.getItem(STORAGE_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user: unknown) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    },

    clearUser: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};

// Type alias for token refresh callback
type TokenCallback = (token: string) => void;

export class ApiClient {
    private static isRefreshing = false;
    private static refreshSubscribers: TokenCallback[] = [];

    // Subscribe to token refresh
    private static subscribeToTokenRefresh(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    // Notify all subscribers that token is refreshed
    private static onTokenRefreshed(token: string) {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    // Retry logic with exponential backoff
    private static async retryRequest<T>(
        fn: () => Promise<T>,
        retries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;

            // Only retry on network errors or 5xx errors
            if (error instanceof ApiRequestError && error.status < 500) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retryRequest(fn, retries - 1, delay * 2);
        }
    }

    // Refresh access token
    private static async refreshAccessToken(): Promise<string | null> {
        const { refreshToken } = TokenManager.getTokens();
        if (!refreshToken) return null;

        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!response.ok) {
                TokenManager.clearTokens();
                return null;
            }

            const data = await response.json();
            const { access_token, refresh_token: newRefreshToken } = data;

            TokenManager.setTokens(access_token, newRefreshToken || refreshToken);

            // Update user data if included
            if (data.user) {
                UserManager.setUser(data.user);
            }

            return access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            TokenManager.clearTokens();
            return null;
        }
    }

    private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const {
            method = 'GET',
            headers = {},
            body,
            retries = 3,
            skipAuth = false
        } = options;

        return this.retryRequest(async () => {
            let token = options.token;

            // Get token from storage if not provided and not skipping auth
            if (!token && !skipAuth) {
                const { token: storedToken } = TokenManager.getTokens();

                // Check if token needs refresh
                if (storedToken && TokenManager.isTokenExpired(storedToken)) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true;
                        const newToken = await this.refreshAccessToken();
                        this.isRefreshing = false;
                        this.onTokenRefreshed(newToken || '');

                        if (!newToken) {
                            // Token refresh failed, redirect to login
                            window.location.href = '/login';
                            throw new ApiRequestError('Session expired. Please login again.', 401);
                        }
                        token = newToken;
                    } else {
                        // Wait for token refresh to complete
                        await new Promise(resolve => {
                            this.subscribeToTokenRefresh((newToken: string) => {
                                token = newToken;
                                resolve(null);
                            });
                        });
                    }
                } else {
                    token = storedToken;
                }
            }

            const config: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                    ...headers,
                },
                ...(body && { body: JSON.stringify(body) }),
            };

            const response = await fetch(`${API_URL}${endpoint}`, config);

            if (!response.ok) {
                const status = response.status;

                // Handle 401 Unauthorized
                if (status === 401) {
                    // Try to refresh token if we haven't already
                    if (!skipAuth && token && !this.isRefreshing) {
                        const newToken = await this.refreshAccessToken();
                        if (newToken) {
                            // Retry with new token
                            return this.request<T>(endpoint, {
                                ...options,
                                token: newToken
                            });
                        }
                    }

                    // Clear tokens and redirect to login
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    throw new ApiRequestError('Authentication required', 401);
                }

                // Handle 403 Forbidden
                if (status === 403) {
                    throw new ApiRequestError('You do not have permission to perform this action', 403);
                }

                // Handle 404 Not Found
                if (status === 404) {
                    throw new ApiRequestError('The requested resource was not found', 404);
                }

                // Handle 429 Too Many Requests
                if (status === 429) {
                    throw new ApiRequestError('Too many requests. Please try again later.', 429);
                }

                // Handle 500+ Server Errors
                if (status >= 500) {
                    throw new ApiRequestError('Server error. Please try again later.', status);
                }

                // Parse error response
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || errorData.message || `API Error: ${response.statusText}`;
                throw new ApiRequestError(message, status, errorData.code);
            }

            return response.json();
        }, retries);
    }

    static get<T>(endpoint: string, headers?: Record<string, string>, options?: Partial<RequestOptions>) {
        return this.request<T>(endpoint, { method: 'GET', headers, ...options });
    }

    static post<T>(endpoint: string, body: unknown, headers?: Record<string, string>, options?: Partial<RequestOptions>) {
        return this.request<T>(endpoint, { method: 'POST', body, headers, ...options });
    }

    static put<T>(endpoint: string, body: unknown, headers?: Record<string, string>, options?: Partial<RequestOptions>) {
        return this.request<T>(endpoint, { method: 'PUT', body, headers, ...options });
    }

    static patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>, options?: Partial<RequestOptions>) {
        return this.request<T>(endpoint, { method: 'PATCH', body, headers, ...options });
    }

    static delete<T>(endpoint: string, headers?: Record<string, string>, options?: Partial<RequestOptions>) {
        return this.request<T>(endpoint, { method: 'DELETE', headers, ...options });
    }

    // For file uploads (FormData)
    static async upload<T>(endpoint: string, formData: FormData, options?: Partial<RequestOptions>): Promise<T> {
        let token = options?.token;

        if (!token && !options?.skipAuth) {
            const { token: storedToken } = TokenManager.getTokens();
            token = storedToken || undefined;
        }

        const config: RequestInit = {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options?.headers,
            },
            body: formData,
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiRequestError(
                errorData.detail || `Upload failed: ${response.statusText}`,
                response.status
            );
        }

        return response.json();
    }
}
