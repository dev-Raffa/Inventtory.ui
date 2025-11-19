import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from './';
import type { ICategory } from '../types';

const { mockSupabase, mockSelect, mockSingle, mockInsert } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockSingle = vi.fn();

  const mockSupabase = {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      single: mockSingle
    }))
  };

  return {
    mockSupabase,
    mockSelect,
    mockSingle,
    mockInsert
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

const mockCategories = [
  { id: 'c1', name: 'Roupas' },
  { id: 'c2', name: 'Eletrônicos' }
] as ICategory[];

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return the list of categories if successful', async () => {
      mockSelect.mockResolvedValueOnce({ data: mockCategories, error: null });

      const result = await CategoryService.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if the database returns null/empty', async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: null });

      const result = await CategoryService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw an error if the API call fails', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: 'Network Fail' }
      });

      await expect(CategoryService.getAll()).rejects.toThrow(
        'Falha ao buscar categorias'
      );
    });
  });

  describe('create', () => {
    it('must insert a new category and return the created object if successful', async () => {
      const newCategoryName = 'Acessórios';
      const createdCategory = { id: 'c3', name: newCategoryName } as ICategory;

      mockSingle.mockResolvedValueOnce({ data: createdCategory, error: null });

      const result = await CategoryService.create(newCategoryName);

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockInsert).toHaveBeenCalledWith({ name: newCategoryName });
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSingle).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdCategory);
    });

    it('should throw an error if category insertion fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Duplicate Key' }
      });

      await expect(CategoryService.create('Duplicata')).rejects.toThrow(
        'Falha ao criar categoria'
      );
    });
  });
});
