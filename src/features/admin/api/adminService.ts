import { ApiClient } from '../../../lib/api-client';
import { User, Role } from '../../../types';

export interface AdminUserResponse extends User {
    created_at: string;
    updated_at: string;
    last_login?: string;
    projects_count: number;
}

export interface UserCreateData {
    email: string;
    name: string;
    password?: string;
    role: Role;
    organization?: string;
    discipline?: string;
    iso_role?: string;
    phone?: string;
    job_title?: string;
    department?: string;
}

export interface UserStats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    users_by_role: Record<string, number>;
    users_by_discipline: Record<string, number>;
    recent_logins: Array<{ id: string; name: string; last_login: string }>;
}

export const adminService = {
    /**
     * List all users with optional filtering
     */
    listUsers: async (params?: {
        search?: string;
        role?: string;
        is_active?: boolean;
        skip?: number;
        limit?: number;
    }) => {
        return ApiClient.get<AdminUserResponse[]>('/admin/users', params);
    },

    /**
     * Get a single user by ID
     */
    getUser: async (id: string) => {
        return ApiClient.get<AdminUserResponse>(`/admin/users/${id}`);
    },

    /**
     * Create a new user
     */
    createUser: async (data: UserCreateData) => {
        return ApiClient.post<AdminUserResponse>('/admin/users', data);
    },

    /**
     * Update an existing user
     */
    updateUser: async (id: string, data: Partial<UserCreateData> & { is_active?: boolean }) => {
        return ApiClient.put<AdminUserResponse>(`/admin/users/${id}`, data);
    },

    /**
     * Deactivate a user
     */
    deleteUser: async (id: string) => {
        return ApiClient.delete(`/admin/users/${id}`);
    },

    /**
     * Get user statistics for dashboard
     */
    getUserStats: async () => {
        return ApiClient.get<UserStats>('/admin/users/stats/overview');
    }
};
