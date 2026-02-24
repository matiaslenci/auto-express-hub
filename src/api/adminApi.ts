import axiosClient from './client';
import { AgencyDto } from './types';

export const adminApi = {
    /**
     * Get all agencies
     */
    getAllAgencies: async (): Promise<AgencyDto[]> => {
        const response = await axiosClient.get('/admin/agencies');
        return response.data;
    },

    /**
     * Update agency active status
     */
    updateAgencyStatus: async (id: string, isActive: boolean): Promise<AgencyDto> => {
        const response = await axiosClient.patch(`/admin/agencies/${id}/status`, { isActive });
        return response.data;
    },

    /**
     * Update agency plan
     */
    updateAgencyPlan: async (id: string, plan: 'basico' | 'profesional' | 'premium'): Promise<AgencyDto> => {
        const response = await axiosClient.patch(`/admin/agencies/${id}/plan`, { plan });
        return response.data;
    }
};
