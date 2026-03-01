import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/api/services/vehicle.service';
import { analyticsService } from '@/api/services/analytics.service';
import { VehicleDto, CreateVehicleDto, UpdateVehicleDto, VehicleFilters, AgencyAnalyticsSummaryDto, DailyStatsDto } from '@/api/types';

// Query keys
export const vehicleKeys = {
    all: ['vehicles'] as const,
    lists: () => [...vehicleKeys.all, 'list'] as const,
    list: (filters?: VehicleFilters) => [...vehicleKeys.lists(), filters] as const,
    details: () => [...vehicleKeys.all, 'detail'] as const,
    detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

/**
 * Hook to fetch all vehicles with optional filters (public)
 */
export function useVehicles(filters?: VehicleFilters) {
    return useQuery({
        queryKey: vehicleKeys.list(filters),
        queryFn: () => vehicleService.getVehicles(filters),
    });
}

/**
 * Hook to fetch vehicles owned by the authenticated user (dashboard)
 */
export function useMyVehicles() {
    return useQuery({
        queryKey: ['vehicles', 'my-vehicles'] as const,
        queryFn: () => vehicleService.getMyVehicles(),
    });
}

/**
 * Hook to fetch vehicles for a specific agency by username (catalog)
 */
export function useAgencyVehicles(username: string) {
    return useQuery({
        queryKey: ['vehicles', 'agency', username] as const,
        queryFn: () => vehicleService.getVehiclesByUsername(username),
        enabled: !!username,
    });
}

/**
 * Hook to fetch a single vehicle by ID
 */
export function useVehicle(id: string) {
    return useQuery({
        queryKey: vehicleKeys.detail(id),
        queryFn: () => vehicleService.getVehicleById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new vehicle
 */
export function useCreateVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateVehicleDto) => vehicleService.createVehicle(data),
        onSuccess: () => {
            // Invalidate all vehicle lists
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
        },
    });
}

/**
 * Hook to update a vehicle
 */
export function useUpdateVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDto }) =>
            vehicleService.updateVehicle(id, data),
        onSuccess: (updatedVehicle) => {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
            // Update the specific vehicle in cache
            queryClient.setQueryData(vehicleKeys.detail(updatedVehicle.id), updatedVehicle);
        },
    });
}

/**
 * Hook to delete a vehicle
 */
export function useDeleteVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => vehicleService.deleteVehicle(id),
        onSuccess: (_, deletedId) => {
            // Invalidate all vehicle lists
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
            // Remove from cache
            queryClient.removeQueries({ queryKey: vehicleKeys.detail(deletedId) });
        },
    });
}

/**
 * Hook to track vehicle view
 */
export function useTrackView() {
    return useMutation({
        mutationFn: (id: string) => analyticsService.trackView(id),
    });
}

/**
 * Hook to track WhatsApp click
 */
export function useTrackWhatsAppClick() {
    return useMutation({
        mutationFn: (id: string) => analyticsService.trackWhatsAppClick(id),
    });
}

/**
 * Hook to fetch agency analytics summary
 */
export function useAgencyAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'agency', 'summary'],
        queryFn: () => analyticsService.getAgencySummary(),
    });
}

/**
 * Hook to fetch vehicle specific analytics
 */
export function useVehicleAnalytics(id: string, days: number = 30) {
    return useQuery({
        queryKey: ['analytics', 'vehicle', id, days],
        queryFn: () => analyticsService.getVehicleStats(id, days),
        enabled: !!id,
    });
}
