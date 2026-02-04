import { ApiClient, ApiRequestError } from '../../../lib/api-client';
import { INITIAL_SCHEDULE } from '../../../lib/constants';
import { PlannedTask } from '../../../types';

const USE_MOCK = true;

export const PlannerService = {
    /**
     * Get all planned tasks (schedule)
     */
    getAll: async (): Promise<PlannedTask[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 400));
            return INITIAL_SCHEDULE;
        }

        return ApiClient.get<PlannedTask[]>('/planner/tasks');
    },

    /**
     * Get a single task by ID
     */
    getById: async (id: string): Promise<PlannedTask> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const task = INITIAL_SCHEDULE.find(t => t.id === id);
            if (!task) {
                throw new ApiRequestError('Task not found', 404);
            }
            return task;
        }

        return ApiClient.get<PlannedTask>(`/planner/tasks/${id}`);
    },

    /**
     * Create a new task
     */
    create: async (data: Omit<PlannedTask, 'id'>): Promise<PlannedTask> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return {
                id: `t${Date.now()}`,
                ...data
            };
        }

        return ApiClient.post<PlannedTask>('/planner/tasks', data);
    },

    /**
     * Update a task (move, resize, change details)
     */
    update: async (id: string, data: Partial<PlannedTask>): Promise<PlannedTask> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const task = INITIAL_SCHEDULE.find(t => t.id === id);
            if (!task) {
                throw new ApiRequestError('Task not found', 404);
            }
            return { ...task, ...data };
        }

        return ApiClient.put<PlannedTask>(`/planner/tasks/${id}`, data);
    },

    /**
     * Delete a task
     */
    delete: async (id: string): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { message: 'Task deleted successfully' };
        }

        return ApiClient.delete<{ message: string }>(`/planner/tasks/${id}`);
    },

    /**
     * Update task dependencies
     */
    updateDependencies: async (id: string, dependencies: PlannedTask['dependencies']): Promise<PlannedTask> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const task = INITIAL_SCHEDULE.find(t => t.id === id);
            if (!task) {
                throw new ApiRequestError('Task not found', 404);
            }
            return { ...task, dependencies };
        }

        return ApiClient.put<PlannedTask>(`/planner/tasks/${id}/dependencies`, { dependencies });
    },

    /**
     * Sync with Field module (link tasks)
     */
    syncWithField: async (taskId: string, fieldTaskId: string): Promise<PlannedTask> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const task = INITIAL_SCHEDULE.find(t => t.id === taskId);
            if (!task) {
                throw new ApiRequestError('Task not found', 404);
            }
            return { ...task, linkedFieldTaskId: fieldTaskId };
        }

        return ApiClient.post<PlannedTask>(`/planner/tasks/${taskId}/link-field`, { fieldTaskId });
    }
};
