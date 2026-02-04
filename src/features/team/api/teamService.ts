import { ApiClient, ApiRequestError } from '../../../lib/api-client';
import { User } from '../../../types';

const USE_MOCK = true;

const MOCK_TEAM: User[] = [
    { id: '1', name: 'Alex Mercer', email: 'alex.m@skyline.com', role: 'Project Manager', avatar: 'AM' },
    { id: '2', name: 'Sarah Chen', email: 'sarah.c@skyline.com', role: 'Admin', avatar: 'SC' },
    { id: '3', name: 'Mike Ross', email: 'mike.r@construction.com', role: 'Viewer', avatar: 'MR' },
];

interface CreateUserData {
    name: string;
    email: string;
    role: User['role'];
}

interface UpdateUserData {
    name?: string;
    email?: string;
    role?: User['role'];
}

export const TeamService = {
    /**
     * Get all team members
     */
    getAll: async (): Promise<User[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 400));
            return MOCK_TEAM;
        }

        return ApiClient.get<User[]>('/team');
    },

    /**
     * Get a single team member by ID
     */
    getById: async (id: string): Promise<User> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const member = MOCK_TEAM.find(m => m.id === id);
            if (!member) {
                throw new ApiRequestError('Team member not found', 404);
            }
            return member;
        }

        return ApiClient.get<User>(`/team/${id}`);
    },

    /**
     * Invite a new team member
     */
    invite: async (data: CreateUserData & { projectId?: string }): Promise<User> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 700));
            return {
                id: `u${Date.now()}`,
                ...data,
                avatar: data.name.charAt(0).toUpperCase()
            };
        }

        return ApiClient.post<User>('/team/invite', data);
    },

    /**
     * Update team member details
     */
    update: async (id: string, data: UpdateUserData): Promise<User> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const member = MOCK_TEAM.find(m => m.id === id);
            if (!member) {
                throw new ApiRequestError('Team member not found', 404);
            }
            return { ...member, ...data };
        }

        return ApiClient.put<User>(`/team/${id}`, data);
    },

    /**
     * Remove a team member
     */
    remove: async (id: string): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { message: 'Team member removed successfully' };
        }

        return ApiClient.delete<{ message: string }>(`/team/${id}`);
    },

    /**
     * Update team member role
     */
    updateRole: async (id: string, role: User['role']): Promise<User> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const member = MOCK_TEAM.find(m => m.id === id);
            if (!member) {
                throw new ApiRequestError('Team member not found', 404);
            }
            return { ...member, role };
        }

        return ApiClient.put<User>(`/team/${id}/role`, { role });
    }
};
