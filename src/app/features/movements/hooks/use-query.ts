import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MovementService } from '../service';
import type { Movement } from '../types';

export function useMovementsQuery(filters?: { productId?: string }) {
  return useQuery({
    queryKey: ['movements', filters],
    queryFn: () => MovementService.getAll(filters ? filters : undefined)
  });
}

export function useCreateMovementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Movement) => MovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
