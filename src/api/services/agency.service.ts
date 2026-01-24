import apiClient from '../client';
import { AgencyDto, UpdateAgencyDto } from '../types';

export const agencyService = {
    /**
     * Get agency profile by username
     * GET /agencies/:username
     */
    async getAgencyByUsername(username: string): Promise<AgencyDto> {
        const response = await apiClient.get<AgencyDto>(`/agencies/${username}`);
        return response.data;
    },

    /**
     * Update agency profile (requires authentication)
     * PATCH /agencies/profile
     */
    async updateProfile(data: UpdateAgencyDto): Promise<AgencyDto> {
        const response = await apiClient.patch<AgencyDto>('/agencies/profile', data);
        return response.data;
    },
};
