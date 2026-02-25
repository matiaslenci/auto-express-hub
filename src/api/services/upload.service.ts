import apiClient from '../client';

export interface UploadResponse {
    url: string;
    filename: string;
}

export const uploadService = {
    /**
     * Upload vehicle image
     * POST /uploads/vehicle-image
     */
    async uploadVehicleImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<UploadResponse>('/uploads/vehicle-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Upload agency logo
     * POST /uploads/agency-logo
     */
    async uploadAgencyLogo(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<UploadResponse>('/uploads/agency-logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Upload agency cover image
     * POST /uploads/agency-cover
     */
    async uploadAgencyCover(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<UploadResponse>('/uploads/agency-cover', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Delete an uploaded image
     * DELETE /uploads/{folder}/{filename}
     */
    async deleteImage(folder: 'vehicles' | 'agencies', filename: string): Promise<void> {
        await apiClient.delete(`/uploads/${folder}/${filename}`);
    },
};
