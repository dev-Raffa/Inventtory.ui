import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MovementService } from '../service';
import { useMovementsQuery, useCreateMovementMutation } from './use-query';
import type { MovementResponse, Movement } from '../types';

vi.mock('../service', () => ({
  MovementService: {
    getAll: vi.fn(),
    create: vi.fn()
  }
}));

describe('Movements Hooks', () => {
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

  describe('useMovementsQuery', () => {
    it('should fetch movements without filters using MovementService.getAll', async () => {
      const mockMovements = [
        { id: '1', type: 'entry', totalQuantity: 10 }
      ] as MovementResponse[];

      vi.mocked(MovementService.getAll).mockResolvedValue(mockMovements);

      const { result } = renderHook(() => useMovementsQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(MovementService.getAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockMovements);
    });

    it('should fetch movements with filters when provided', async () => {
      const mockMovements = [] as MovementResponse[];
      const filters = { productId: 'prod-123' };

      vi.mocked(MovementService.getAll).mockResolvedValue(mockMovements);

      const { result } = renderHook(() => useMovementsQuery(filters), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(MovementService.getAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('useCreateMovementMutation', () => {
    it('should create movement and invalidate correct query keys on success', async () => {
      const payload = {
        type: 'entry',
        totalQuantity: 5,
        items: []
      } as unknown as Movement;

      vi.mocked(MovementService.create).mockResolvedValue();

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateMovementMutation(), {
        wrapper
      });

      await result.current.mutateAsync(payload);

      expect(MovementService.create).toHaveBeenCalledWith(payload);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['movements'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    });
  });
});
