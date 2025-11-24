import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MovementService } from '../service';
import type { CreateMovementDTO } from '../types/model';

export function useMovementsQuery(filters?: { productId?: string }) {
  return useQuery({
    queryKey: ['movements', filters],
    queryFn: () => MovementService.getAll(filters ? filters : undefined)
  });
}

export function useCreateMovementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovementDTO) => MovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
