import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from '.';
import type { Category } from '../types';

const {
  mockSupabase,
  mockSelect,
  mockOrder,
  mockInsert,
  mockSingle,
  mockOverrideTypes
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockInsert = vi.fn();
  const mockSingle = vi.fn();
  const mockOverrideTypes = vi.fn();

  const queryBuilder = {
    select: mockSelect,
    order: mockOrder,
    insert: mockInsert,
    single: mockSingle,
    overrideTypes: mockOverrideTypes
  };

  mockSelect.mockReturnValue(queryBuilder);
  mockOrder.mockReturnValue(queryBuilder);
  mockInsert.mockReturnValue(queryBuilder);
  mockSingle.mockReturnValue(queryBuilder);

  return {
    mockSupabase: {
      from: vi.fn(() => queryBuilder)
    },
    mockSelect,
    mockOrder,
    mockInsert,
    mockSingle,
    mockOverrideTypes
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

const mockCategories = [
  { id: 'c1', name: 'Roupas' },
  { id: 'c2', name: 'Eletrônicos' }
] as Category[];

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return the list of categories if successful', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: mockCategories,
        error: null
      });

      const result = await CategoryService.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(mockOverrideTypes).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if the database returns null', async () => {
      mockOverrideTypes.mockResolvedValue({ data: null, error: null });

      const result = await CategoryService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw specific error message for network failure', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Network request failed', code: '' }
      });

      await expect(CategoryService.getAll()).rejects.toThrow(
        'Erro de conexão. Verifique sua internet.'
      );
    });
  });

  describe('create', () => {
    it('must insert a new category and return the created object if successful', async () => {
      const newCategoryName = 'Acessórios';
      const createdCategory = { id: 'c3', name: newCategoryName } as Category;

      mockOverrideTypes.mockResolvedValue({
        data: createdCategory,
        error: null
      });

      const result = await CategoryService.create(newCategoryName);

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockInsert).toHaveBeenCalledWith({ name: newCategoryName });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(mockOverrideTypes).toHaveBeenCalled();
      expect(result).toEqual(createdCategory);
    });

    it('should throw specific error for duplicate category names', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505'
        }
      });

      await expect(CategoryService.create('Duplicata')).rejects.toThrow(
        'Já existe uma categoria com este nome.'
      );
    });

    it('should throw generic error for other failures', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'Unknown Error', code: '500' }
      });

      await expect(CategoryService.create('Erro')).rejects.toThrow(
        'Não foi possível realizar a operação. Tente novamente.'
      );
    });

    it('should throw unexpected error if data is null but no error is returned', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: null
      });

      await expect(CategoryService.create('Nova Categoria')).rejects.toThrow(
        'Erro inesperado: Categoria não retornada.'
      );
    });
  });
});
