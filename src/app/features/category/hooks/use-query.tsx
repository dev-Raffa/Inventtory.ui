import { useMutation, useQuery } from '@tanstack/react-query';
import { CategoryService } from '../service';
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['Categories'],
    queryFn: CategoryService.getAll,
    staleTime: 5000
  });
}

export function useCreateCategoryMutation() {
  return useMutation({});
}
