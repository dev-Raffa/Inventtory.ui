import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MovementService } from './index';
import type { MovementDTO } from '../types/dto';
import type { Movement } from '../types/model';

const {
  mockSupabase,
  mockSelect,
  mockOrder,
  mockEq,
  mockRpc,
  mockOverrideTypes
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockRpc = vi.fn();
  const mockOverrideTypes = vi.fn();

  const queryBuilder = {
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    overrideTypes: mockOverrideTypes
  };

  mockSelect.mockReturnValue(queryBuilder);
  mockOrder.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder);

  return {
    mockSupabase: {
      from: vi.fn(() => queryBuilder),
      rpc: mockRpc
    },
    mockSelect,
    mockOrder,
    mockEq,
    mockRpc,
    mockOverrideTypes
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

describe('MovementService', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getAll', () => {
    it('should fetch and map movements correctly', async () => {
      const mockDTOs: MovementDTO[] = [
        {
          id: '1',
          date: '2023-10-01',
          type: 'entry',
          reason: 'Test',
          total_quantity: 10,
          document_number: null,
          profiles: { full_name: 'User' },
          movement_items: []
        }
      ];

      mockOverrideTypes.mockResolvedValue({
        data: mockDTOs,
        error: null
      });

      const result = await MovementService.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('movements');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should apply productId filter when provided', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [],
        error: null
      });

      await MovementService.getAll({ productId: 'prod-123' });

      expect(mockEq).toHaveBeenCalledWith(
        'movement_items.product_id',
        'prod-123'
      );
    });

    it('should throw handled error when fetch fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'DB Error', code: 'PGRST000' }
      });

      await expect(MovementService.getAll()).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar a movimentação.'
      );
    });
  });

  describe('create', () => {
    it('should call RPC with correct payload', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const payload: Movement = {
        date: new Date(),
        type: 'entry',
        reason: 'Initial',
        totalQuantity: 10,
        items: []
      };

      await MovementService.create(payload);

      expect(mockRpc).toHaveBeenCalledWith(
        'create_stock_movement',
        expect.objectContaining({
          payload: expect.objectContaining({
            type: 'entry',
            reason: 'Initial'
          })
        })
      );
    });

    it('should throw handled error when RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC Error', code: 'P0001' }
      });

      const payload: Movement = {
        date: new Date(),
        type: 'entry',
        reason: 'Fail',
        totalQuantity: 0,
        items: []
      };

      await expect(MovementService.create(payload)).rejects.toThrow(
        'RPC Error'
      );
    });
  });
});
