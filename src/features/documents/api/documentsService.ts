import { ApiClient, ApiRequestError } from '../../../lib/api-client';
import { MOCK_FILES } from '../../../lib/constants';
import { FileEntry } from '../../../types';

// Toggle this to switch between Real API and Mocks
// Set to false when backend is ready
const USE_MOCK = false;

interface GetAllParams {
    status?: string;
    folder?: 'wip' | 'shared' | 'published' | 'archive';
    discipline?: string;
    search?: string;
}

interface UploadResponse extends FileEntry {
    message?: string;
}

interface WorkflowResponse {
    message: string;
    new_status: string;
    new_revision?: string;
    action?: string;
}

/**
 * RBAC Error class for handling permission-related errors
 */
export class RBACError extends Error {
    constructor(
        message: string,
        public statusCode: number = 403,
        public action: string = 'access'
    ) {
        super(message);
        this.name = 'RBACError';
    }
}

export const DocumentsService = {
    /**
     * Fetch all documents, optionally filtered by ISO status
     */
    getAll: async (params?: GetAllParams): Promise<FileEntry[]> => {
        if (USE_MOCK) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 600));

            // Client-side filtering for mock data
            let filtered = [...MOCK_FILES];

            if (params?.discipline) {
                filtered = filtered.filter(f => f.discipline === params.discipline);
            }

            if (params?.search) {
                const searchLower = params.search.toLowerCase();
                filtered = filtered.filter(f =>
                    f.name.toLowerCase().includes(searchLower) ||
                    f.author.toLowerCase().includes(searchLower)
                );
            }

            return filtered;
        }

        // Build query string
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.folder) queryParams.append('folder', params.folder);
        if (params?.discipline) queryParams.append('discipline', params.discipline);
        if (params?.search) queryParams.append('search', params.search);

        const query = queryParams.toString();
        const endpoint = `/documents${query ? `?${query}` : ''}`;

        return ApiClient.get<FileEntry[]>(endpoint);
    },

    /**
     * Get a single document by ID
     * @throws {RBACError} If user doesn't have permission to view the document
     */
    getById: async (id: string): Promise<FileEntry> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const doc = MOCK_FILES.find(f => f.id === id);
            if (!doc) {
                throw new ApiRequestError('Document not found', 404);
            }
            return doc;
        }

        try {
            return await ApiClient.get<FileEntry>(`/documents/${id}`);
        } catch (error) {
            if (error instanceof ApiRequestError && error.status === 403) {
                throw new RBACError(
                    'You do not have permission to view this document. WIP documents are only visible to their author and Admin users.',
                    403,
                    'view'
                );
            }
            throw error;
        }
    },

    /**
     * Upload a new information container
     */
    upload: async (formData: FormData): Promise<UploadResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const file = formData.get('file') as File;
            const discipline = formData.get('discipline') as string || 'Architecture';
            const description = formData.get('description') as string;

            return {
                id: `new-${Date.now()}`,
                name: file?.name || 'Untitled Document',
                rev: 'P01',
                status: 'S0',
                size: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
                date: new Date().toISOString().split('T')[0],
                discipline,
                author: 'Current User',
                description,
                versions: [{
                    rev: 'P01',
                    date: new Date().toISOString().split('T')[0],
                    author: 'Current User',
                    comment: 'Initial upload',
                    status: 'S0'
                }],
                message: 'Document uploaded successfully'
            };
        }

        return ApiClient.upload<UploadResponse>('/documents', formData);
    },

    /**
     * Update document metadata
     * @throws {RBACError} If user doesn't have permission to update the document
     */
    update: async (id: string, data: Partial<FileEntry>): Promise<FileEntry> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const doc = MOCK_FILES.find(f => f.id === id);
            if (!doc) {
                throw new ApiRequestError('Document not found', 404);
            }
            return { ...doc, ...data };
        }

        try {
            return await ApiClient.put<FileEntry>(`/documents/${id}`, data);
        } catch (error) {
            if (error instanceof ApiRequestError && error.status === 403) {
                throw new RBACError(
                    'You do not have permission to update this document. Only the document author can update WIP documents.',
                    403,
                    'update'
                );
            }
            throw error;
        }
    },

    /**
     * Delete a document
     * @throws {RBACError} If user doesn't have permission to delete the document
     */
    delete: async (id: string): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { message: 'Document deleted successfully' };
        }

        try {
            return await ApiClient.delete<{ message: string }>(`/documents/${id}`);
        } catch (error) {
            if (error instanceof ApiRequestError && error.status === 403) {
                throw new RBACError(
                    'You do not have permission to delete this document. Only Admin users can delete documents.',
                    403,
                    'delete'
                );
            }
            throw error;
        }
    },

    /**
     * Promote a container (Workflow Transition)
     * in ISO 19650: WIP -> Shared -> Published
     * @throws {RBACError} If user doesn't have permission to promote the document
     */
    promote: async (id: string, targetState: string): Promise<WorkflowResponse> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                message: `Document promoted to ${targetState}`,
                new_status: targetState
            };
        }

        try {
            return await ApiClient.post<WorkflowResponse>(`/documents/${id}/workflow`, {
                state: targetState
            });
        } catch (error) {
            if (error instanceof ApiRequestError && error.status === 403) {
                throw new RBACError(
                    'You do not have permission to promote this document. Only the document author can promote WIP documents.',
                    403,
                    'promote'
                );
            }
            throw error;
        }
    },

    /**
     * Download a document
     * @throws {RBACError} If user doesn't have permission to download the document
     */
    download: async (id: string, filename?: string): Promise<void> => {
        if (USE_MOCK) {
            // Mock download - in real implementation, this would trigger a file download
            console.warn(`[Mock] Downloading document ${id}`);
            return;
        }

        const { token } = await import('../../../lib/api-client').then(m => m.TokenManager.getTokens());
        const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}/download`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new RBACError(
                    'You do not have permission to download this document. WIP documents are only accessible to their author and Admin users.',
                    403,
                    'download'
                );
            }
            throw new ApiRequestError('Download failed', response.status);
        }

        // Trigger file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Try to get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let downloadFilename = filename || `document-${id}`;

        if (contentDisposition) {
            // Parse Content-Disposition header
            // Format: attachment; filename="file.pdf" or attachment; filename=file.pdf
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                downloadFilename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // Decode URL-encoded filename (e.g., %20 for spaces)
        downloadFilename = decodeURIComponent(downloadFilename);

        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
