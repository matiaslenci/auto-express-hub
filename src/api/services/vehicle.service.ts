import apiClient from '../client';
import { VehicleDto, CreateVehicleDto, UpdateVehicleDto, VehicleFilters } from '../types';

export const vehicleService = {
    /**
     * Create a new vehicle listing (requires authentication)
     * POST /vehicles
     */
    async createVehicle(data: CreateVehicleDto): Promise<VehicleDto> {
        const response = await apiClient.post<VehicleDto>('/vehicles', data);
        return response.data;
    },

    /**
     * Get all vehicles with optional filters (public)
     * GET /vehicles
     */
    async getVehicles(filters?: VehicleFilters): Promise<VehicleDto[]> {
        const response = await apiClient.get<VehicleDto[]>('/vehicles', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Get vehicles owned by the authenticated user (requires JWT)
     * GET /vehicles/my-vehicles
     */
    async getMyVehicles(): Promise<VehicleDto[]> {
        const response = await apiClient.get<VehicleDto[]>('/vehicles/my-vehicles');
        return response.data;
    },

    /**
     * Get vehicle details by ID
     * GET /vehicles/:id
     */
    async getVehicleById(id: string): Promise<VehicleDto> {
        const response = await apiClient.get<VehicleDto>(`/vehicles/${id}`);
        return response.data;
    },

    /**
     * Update vehicle information (requires authentication)
     * PATCH /vehicles/:id
     */
    async updateVehicle(id: string, data: UpdateVehicleDto): Promise<VehicleDto> {
        const response = await apiClient.patch<VehicleDto>(`/vehicles/${id}`, data);
        return response.data;
    },

    /**
     * Delete a vehicle listing (requires authentication)
     * DELETE /vehicles/:id
     */
    async deleteVehicle(id: string): Promise<void> {
        await apiClient.delete(`/vehicles/${id}`);
    },

    /**
     * Track vehicle view count
     * POST /vehicles/:id/view
     */
    async trackView(id: string): Promise<void> {
        await apiClient.post(`/vehicles/${id}/view`);
    },

    /**
     * Track WhatsApp contact clicks
     * POST /vehicles/:id/whatsapp
     */
    async trackWhatsAppClick(id: string): Promise<void> {
        await apiClient.post(`/vehicles/${id}/whatsapp`);
    },
};
