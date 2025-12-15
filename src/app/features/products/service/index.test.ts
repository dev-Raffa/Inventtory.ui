import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductService } from './index';
import type { ProductDTO } from '../types/dto';

const { mockSupabase, mockSelect, mockEq, mockOverrideTypes, mockRpc } =
  vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockOrder = vi.fn();
    const mockEq = vi.fn();
    const mockSingle = vi.fn();
    const mockOverrideTypes = vi.fn();
    const mockRpc = vi.fn();

    const queryBuilder = {
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
      overrideTypes: mockOverrideTypes,
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis()
    };

    mockSelect.mockReturnValue(queryBuilder);
    mockOrder.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);

    return {
      mockSupabase: {
        from: vi.fn(() => queryBuilder),
        rpc: mockRpc
      },
      mockSelect,
      mockOrder,
      mockEq,
      mockSingle,
      mockOverrideTypes,
      mockRpc
    };
  });

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

const mockProductDTO: ProductDTO = {
  id: '1',
  name: 'Test Product',
  sku: 'TEST-SKU',
  description: 'Desc',
  stock: 10,
  minimum_stock: 2,
  has_variants: false,
  categories: { id: 'c1', name: 'Cat 1' },
  product_attributes: [],
  product_images: [],
  product_variants: []
};

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const consoleErrorSpy = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleErrorSpy.mockReset();
  });

  describe('getAll', () => {
    it('should return mapped products on success', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: [mockProductDTO],
        error: null
      });

      const result = await ProductService.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].category.name).toBe('Cat 1');
    });

    it('should throw handled error on failure', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'DB Error', code: 'PGRST000' }
      });

      await expect(ProductService.getAll()).rejects.toThrow(
        'Ocorreu um erro inesperado ao processar o produto.'
      );
    });
  });

  describe('getOneById', () => {
    it('should return a single mapped product', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockProductDTO,
        error: null
      });

      const result = await ProductService.getOneById('1');

      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result.id).toBe('1');
    });

    it('should throw "Produto não encontrado" for PGRST116', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' }
      });

      await expect(ProductService.getOneById('999')).rejects.toThrow(
        'Produto não encontrado.'
      );
    });
  });

  describe('add', () => {
    it('should call rpc create_product and then fetch the created product', async () => {
      mockRpc.mockResolvedValue({ data: 'new-id', error: null });

      mockOverrideTypes.mockResolvedValue({
        data: { ...mockProductDTO, id: 'new-id' },
        error: null
      });

      const payload: any = { name: 'New Product' };
      const result = await ProductService.add(payload);

      expect(mockRpc).toHaveBeenCalledWith('create_product', {
        product_data: payload
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'new-id');
      expect(result.id).toBe('new-id');
    });

    it('should throw handled error if RPC fails', async () => {
      consoleErrorSpy.mockImplementation(() => {});
      mockRpc.mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'Duplicate SKU',
          details: 'Key (sku)=(123) already exists',
          hint: ''
        }
      });

      const payload: any = { name: 'Dup' };

      await expect(ProductService.add(payload)).rejects.toThrow(
        'Já existe um produto cadastrado com este Nome ou SKU.'
      );
    });
  });

  describe('update', () => {
    it('should call rpc update_product and fetch result', async () => {
      mockRpc.mockResolvedValue({ data: '1', error: null });

      mockOverrideTypes.mockResolvedValue({
        data: mockProductDTO,
        error: null
      });

      const payload: any = { id: '1', name: 'Updated' };
      await ProductService.update(payload);

      expect(mockRpc).toHaveBeenCalledWith('update_product', {
        product_data: payload
      });
    });
  });
});
