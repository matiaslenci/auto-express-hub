import apiClient from '../client';
import { DailyStatsDto, AgencyAnalyticsSummaryDto } from '../types';

export const analyticsService = {
    /**
     * Track vehicle view count
     * POST /analytics/vehicle/:id/view
     */
    async trackView(id: string): Promise<void> {
        await apiClient.post(`/analytics/vehicle/${id}/view`);
    },

    /**
     * Track WhatsApp contact clicks
     * POST /analytics/vehicle/:id/whatsapp-click
     */
    async trackWhatsAppClick(id: string): Promise<void> {
        await apiClient.post(`/analytics/vehicle/${id}/whatsapp-click`);
    },

    /**
     * Get agency analytics summary
     * GET /analytics/agency/summary
     */
    async getAgencySummary(): Promise<AgencyAnalyticsSummaryDto> {
        const response = await apiClient.get<AgencyAnalyticsSummaryDto>('/analytics/agency/summary');
        return response.data;
    },

    /**
     * Get vehicle time-series stats
     * GET /analytics/vehicle/:id/stats?days=30
     */
    async getVehicleStats(id: string, days: number = 30): Promise<DailyStatsDto[]> {
        const response = await apiClient.get<DailyStatsDto[]>(`/analytics/vehicle/${id}/stats`, {
            params: { days },
        });
        return response.data;
    },
};
