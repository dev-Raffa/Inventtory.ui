import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../service';

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
    staleTime: 1000 * 60 * 5
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createProduct'],
    mutationFn: ProductService.add,
    meta: { successMessage: 'Produto criado com sucesso' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useProductUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['UpdateProduct'],
    mutationFn: ProductService.update,
    meta: { successMessage: 'Produto atualizado com sucesso' },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      }
    }
  });
}
