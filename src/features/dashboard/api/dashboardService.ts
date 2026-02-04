import { ApiClient } from '../../../lib/api-client';

interface DashboardStats {
    projectHealth: string;
    activeSnags: number;
    completedPercentage: number;
    daysToDeadline: number;
}

interface TaskByType {
    name: string;
    count: number;
    fill: string;
}

interface ProjectHealthData {
    name: string;
    value: number;
    color: string;
}

interface ActivityItem {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    avatar: string;
}

const USE_MOCK = true;

export const DashboardService = {
    /**
     * Get dashboard statistics
     */
    getStats: async (): Promise<DashboardStats> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                projectHealth: 'Good',
                activeSnags: 42,
                completedPercentage: 88,
                daysToDeadline: 112
            };
        }

        return ApiClient.get<DashboardStats>('/dashboard/stats');
    },

    /**
     * Get tasks by type (for charts)
     */
    getTasksByType: async (): Promise<TaskByType[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                { name: 'Defects', count: 12, fill: '#ef4444' },
                { name: 'Safety', count: 4, fill: '#f59e0b' },
                { name: 'RFIs', count: 8, fill: '#3b82f6' },
                { name: 'Observations', count: 15, fill: '#10b981' },
            ];
        }

        return ApiClient.get<TaskByType[]>('/dashboard/tasks-by-type');
    },

    /**
     * Get project health data (for pie chart)
     */
    getProjectHealth: async (): Promise<ProjectHealthData[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                { name: 'On Track', value: 75, color: '#10b981' },
                { name: 'Delayed', value: 25, color: '#f59e0b' },
            ];
        }

        return ApiClient.get<ProjectHealthData[]>('/dashboard/health');
    },

    /**
     * Get recent activity
     */
    getActivity: async (limit: number = 10): Promise<ActivityItem[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                {
                    id: '1',
                    user: 'Alex Mercer',
                    action: 'Uploaded drawing',
                    target: 'A-101 Floorplan',
                    time: '2 hours ago',
                    avatar: 'AM'
                },
                {
                    id: '2',
                    user: 'Sarah Lane',
                    action: 'Closed snag',
                    target: 'Exposed Wiring - L2',
                    time: '4 hours ago',
                    avatar: 'SL'
                },
                {
                    id: '3',
                    user: 'John Smith',
                    action: 'Created RFI',
                    target: 'Foundation Detail Conflict',
                    time: 'Yesterday',
                    avatar: 'JS'
                },
            ];
        }

        return ApiClient.get<ActivityItem[]>(`/dashboard/activity?limit=${limit}`);
    }
};
