import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../service';

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
    staleTime: 5000
  });
}

export function useProductByIDQuery(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: ({ queryKey }: { queryKey: ['product', string] }) =>
      ProductService.getOneById(queryKey[1])
  });
}

export function useProductCreateMutation() {
  const { invalidateQueries } = useQueryClient();

  return useMutation({
    mutationFn: ProductService.add,
    onSuccess: () => {
      invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useProductUpdateMutation() {
  const { invalidateQueries } = useQueryClient();

  return useMutation({
    mutationFn: ProductService.update,
    onSuccess: (data) => {
      invalidateQueries({ queryKey: ['products'] });

      if (data.id) {
        invalidateQueries({ queryKey: ['product', data.id] });
      }
    }
  });
}
