import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryService } from '../service';
import { useCategoriesQuery, useCreateCategoryMutation } from './use-query';

vi.mock('../service', () => ({
  CategoryService: {
    getAll: vi.fn(),
    create: vi.fn()
  }
}));

describe('Category Hooks', () => {
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

  describe('useCategoriesQuery', () => {
    it('should fetch categories using CategoryService.getAll', async () => {
      const mockCategories = [
        { id: '1', name: 'Roupas' },
        { id: '2', name: 'Eletrônicos' }
      ];

      vi.mocked(CategoryService.getAll).mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategoriesQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(CategoryService.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockCategories);
    });
  });

  describe('useCreateCategoryMutation', () => {
    it('should create category and invalidate "Categories" query key on success', async () => {
      const newCategoryName = 'Acessórios';
      const createdCategory = { id: '3', name: newCategoryName };

      vi.mocked(CategoryService.create).mockResolvedValue(createdCategory);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateCategoryMutation(), {
        wrapper
      });

      await result.current.mutateAsync(newCategoryName);

      expect(CategoryService.create).toHaveBeenCalledWith(
        newCategoryName,
        expect.anything()
      );

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['Categories'] });
    });
  });
});
