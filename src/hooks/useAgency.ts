import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agencyService } from '@/api/services/agency.service';
import { AgencyDto, UpdateAgencyDto } from '@/api/types';

// Query keys
export const agencyKeys = {
    all: ['agencies'] as const,
    details: () => [...agencyKeys.all, 'detail'] as const,
    detail: (username: string) => [...agencyKeys.details(), username] as const,
};

/**
 * Hook to fetch agency by username
 */
export function useAgency(username: string) {
    return useQuery({
        queryKey: agencyKeys.detail(username),
        queryFn: () => agencyService.getAgencyByUsername(username),
        enabled: !!username,
    });
}

/**
 * Hook to update agency profile
 */
export function useUpdateAgency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateAgencyDto) => agencyService.updateProfile(data),
        onSuccess: (updatedAgency) => {
            // Update the specific agency in cache
            queryClient.setQueryData(agencyKeys.detail(updatedAgency.username), updatedAgency);
            // Invalidate all agency queries to be safe
            queryClient.invalidateQueries({ queryKey: agencyKeys.all });
        },
    });
}
