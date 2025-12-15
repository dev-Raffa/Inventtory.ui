import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductService } from '../service';
import {
  useProductsQuery,
  useProductByIDQuery,
  useProductCreateMutation,
  useProductUpdateMutation
} from './use-query';
import type { IProduct } from '../types';

vi.mock('../service', () => ({
  ProductService: {
    getAll: vi.fn(),
    getOneById: vi.fn(),
    add: vi.fn(),
    update: vi.fn()
  }
}));

describe('Products Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useProductsQuery', () => {
    it('should fetch products using ProductService.getAll', async () => {
      const mockProducts = [{ id: '1', name: 'Product A' }] as IProduct[];
      vi.mocked(ProductService.getAll).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductsQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ProductService.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockProducts);
    });
  });

  describe('useProductByIDQuery', () => {
    it('should fetch a single product using ProductService.getOneById', async () => {
      const productId = '123';
      const mockProduct = { id: productId, name: 'Product B' } as IProduct;
      vi.mocked(ProductService.getOneById).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProductByIDQuery(productId), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ProductService.getOneById).toHaveBeenCalledWith(productId);
      expect(result.current.data).toEqual(mockProduct);
    });
  });

  describe('useProductCreateMutation', () => {
    it('should create product and invalidate "products" query', async () => {
      const payload = { name: 'New Product' } as IProduct;
      vi.mocked(ProductService.add).mockResolvedValue({
        id: 'new',
        ...payload
      } as IProduct);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useProductCreateMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(ProductService.add).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    });
  });

  describe('useProductUpdateMutation', () => {
    it('should update product and invalidate both "products" and specific "product" queries', async () => {
      const payload = { id: '123', name: 'Updated Product' } as IProduct;

      vi.mocked(ProductService.update).mockResolvedValue(payload);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useProductUpdateMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(ProductService.update).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['product', '123']
      });
    });

    it('should NOT invalidate specific product query if id is missing in response', async () => {
      const payload = { name: 'Updated Without ID' } as IProduct;

      vi.mocked(ProductService.update).mockResolvedValue({
        ...payload,
        id: undefined
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useProductUpdateMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
