import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../service';
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['Categories'],
    queryFn: CategoryService.getAll,
    staleTime: 5000
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['CreateCategory'],
    mutationFn: CategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Categories'] });
    }
  });
}
