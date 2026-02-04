import { ApiClient, ApiRequestError } from '../../../lib/api-client';
import { MOCK_INSPECTIONS } from '../../../lib/constants';
import { Inspection } from '../../../types';

const USE_MOCK = true;

interface CreateInspectionData {
    title: string;
    type: 'QA' | 'QC' | 'Safety' | 'Environmental' | 'Commissioning';
    location: string;
    assignedTo: string;
    date: string;
    isoSuitability: string;
    refContainer?: string;
}

interface UpdateInspectionData {
    title?: string;
    status?: Inspection['status'];
    checklist?: Inspection['checklist'];
}

export const InspectionsService = {
    /**
     * Get all inspections with optional filtering
     */
    getAll: async (filters?: {
        type?: string;
        status?: string;
        assignedTo?: string;
    }): Promise<Inspection[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            let filtered = [...MOCK_INSPECTIONS];

            if (filters?.type) {
                filtered = filtered.filter(i => i.type.toLowerCase() === filters.type.toLowerCase());
            }

            if (filters?.status) {
                filtered = filtered.filter(i => i.status === filters.status);
            }

            if (filters?.assignedTo) {
                filtered = filtered.filter(i => i.assignedTo === filters.assignedTo);
            }

            return filtered;
        }

        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.assignedTo) params.append('assigned_to', filters.assignedTo);

        const query = params.toString();
        return ApiClient.get<Inspection[]>(`/inspections${query ? `?${query}` : ''}`);
    },

    /**
     * Get a single inspection by ID
     */
    getById: async (id: string): Promise<Inspection> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const inspection = MOCK_INSPECTIONS.find(i => i.id === id);
            if (!inspection) {
                throw new ApiRequestError('Inspection not found', 404);
            }
            return inspection;
        }

        return ApiClient.get<Inspection>(`/inspections/${id}`);
    },

    /**
     * Create a new inspection
     */
    create: async (data: CreateInspectionData): Promise<Inspection> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 700));
            return {
                id: `INS-${Date.now().toString().slice(-6)}`,
                ...data,
                checklist: []
            };
        }

        return ApiClient.post<Inspection>('/inspections', data);
    },

    /**
     * Update an inspection
     */
    update: async (id: string, data: UpdateInspectionData): Promise<Inspection> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const inspection = MOCK_INSPECTIONS.find(i => i.id === id);
            if (!inspection) {
                throw new ApiRequestError('Inspection not found', 404);
            }
            return { ...inspection, ...data };
        }

        return ApiClient.put<Inspection>(`/inspections/${id}`, data);
    },

    /**
     * Delete an inspection
     */
    delete: async (id: string): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { message: 'Inspection deleted successfully' };
        }

        return ApiClient.delete<{ message: string }>(`/inspections/${id}`);
    },

    /**
     * Verify an inspection (complete with passing status)
     */
    verify: async (id: string): Promise<Inspection> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const inspection = MOCK_INSPECTIONS.find(i => i.id === id);
            if (!inspection) {
                throw new ApiRequestError('Inspection not found', 404);
            }
            return { ...inspection, status: 'Verified' };
        }

        return ApiClient.post<Inspection>(`/inspections/${id}/verify`, {});
    },

    /**
     * Reject an inspection
     */
    reject: async (id: string, reason: string): Promise<Inspection> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const inspection = MOCK_INSPECTIONS.find(i => i.id === id);
            if (!inspection) {
                throw new ApiRequestError('Inspection not found', 404);
            }
            return { ...inspection, status: 'Rejected' };
        }

        return ApiClient.post<Inspection>(`/inspections/${id}/reject`, { reason });
    }
};
