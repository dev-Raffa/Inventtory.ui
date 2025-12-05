import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from './';
import type { IProduct } from '../types';

const {
  mockSupabase,
  mockSelect,
  mockEq,
  mockSingle,
  mockOverrideTypes,
  mockRpc
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockOverrideTypes = vi.fn();
  const mockRpc = vi.fn();

  const queryBuilder = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    overrideTypes: mockOverrideTypes
  };

  mockSelect.mockReturnValue(queryBuilder);
  mockEq.mockReturnValue(queryBuilder);
  mockSingle.mockReturnValue(queryBuilder);

  return {
    mockEq,
    mockRpc,
    mockSelect,
    mockSingle,
    mockOverrideTypes,
    mockSupabase: {
      from: vi.fn(() => queryBuilder),
      rpc: mockRpc
    }
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

const supabaseInputData = {
  id: 'p1',
  name: 'Camisa Teste',
  sku: 'TSK-001',
  has_variants: true,
  category: { id: 'cat-1', name: 'Roupas' },
  product_images: [
    { id: 'i2', name: 'Sec', src: 's2', is_primary: false, public_id: 'pb2' },
    { id: 'i1', name: 'Prim', src: 's1', is_primary: true, public_id: 'pb1' }
  ],
  product_attributes: [{ name: 'Cor', values: 'Azul, Verde' }],
  product_variants: [
    {
      id: 'v2',
      sku: 'V-B',
      options: [],
      variant_images: [{ image_id: 'i4', is_primary: false }]
    },
    {
      id: 'v1',
      sku: 'V-A',
      options: [],
      variant_images: [{ image_id: 'i3', is_primary: true }]
    }
  ]
};

const expectedProductOutput: IProduct = {
  id: 'p1',
  name: 'Camisa Teste',
  sku: 'TSK-001',
  description: undefined,
  stock: undefined,
  minimumStock: undefined,
  hasVariants: true,
  category: { id: 'cat-1', name: 'Roupas' },
  attributes: expect.any(Array),
  allImages: expect.arrayContaining([
    expect.objectContaining({ id: 'i1', isPrimary: true, publicId: 'pb1' }),
    expect.objectContaining({ id: 'i2', isPrimary: false, publicId: 'pb2' })
  ]),
  variants: expect.arrayContaining([
    expect.objectContaining({ id: 'v1' }),
    expect.objectContaining({ id: 'v2' })
  ])
};

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const builder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      overrideTypes: mockOverrideTypes
    };

    mockSupabase.from.mockReturnValue(builder);
    mockSelect.mockReturnValue(builder);
    mockEq.mockReturnValue(builder);
    mockSingle.mockReturnValue(builder);
  });

  it.skip('must map snake_case to camelCase and order main images (Global)', () => {
    mockOverrideTypes.mockResolvedValue({
      data: [supabaseInputData],
      error: null
    });

    const serviceCall = ProductService.getAll();

    expect(serviceCall).resolves.toEqual([expectedProductOutput]);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOverrideTypes).toHaveBeenCalled();
  });

  it.skip('must map image_id to "id" and sort variant images', async () => {
    mockOverrideTypes.mockResolvedValue({
      data: [supabaseInputData],
      error: null
    });

    const receivedProducts = await ProductService.getAll();
    const transformedProduct = receivedProducts[0];
    const receivedVariantV2 = transformedProduct.variants?.find(
      (v) => v.id === 'v2'
    );

    expect(receivedVariantV2).toEqual(
      expect.objectContaining({
        id: 'v2',
        sku: 'V-B',
        images: expect.arrayContaining([
          expect.objectContaining({ id: 'i4', isPrimary: false })
        ])
      })
    );

    const receivedVariantV1 = transformedProduct.variants?.find(
      (v) => v.id === 'v1'
    );

    expect(receivedVariantV1).toEqual(
      expect.objectContaining({
        id: 'v1',
        sku: 'V-A',
        images: expect.arrayContaining([
          expect.objectContaining({ id: 'i3', isPrimary: true })
        ])
      })
    );
  });

  describe('getAll', () => {
    it.skip('should call the API and throw an error in case of failure.', async () => {
      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: 'DB Down' }
      });

      await expect(ProductService.getAll()).rejects.toThrow(
        'Falha ao buscar produtos'
      );
    });
  });

  describe('getOneById', () => {
    it('should call the API using the ID and return the transformed product', async () => {
      const mockData = { ...supabaseInputData };

      mockOverrideTypes.mockResolvedValue({ data: mockData, error: null });

      await ProductService.getOneById('p1');

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('id', 'p1');
      expect(mockSingle).toHaveBeenCalledTimes(1);
      expect(mockOverrideTypes).toHaveBeenCalledTimes(1);
    });

    it('should throw an error with the specific message when the API fails', async () => {
      const customErrorMessage = 'Record not found for ID: 999';

      mockOverrideTypes.mockResolvedValue({
        data: null,
        error: { message: customErrorMessage }
      });

      await expect(ProductService.getOneById('999')).rejects.toThrow(
        `Erro ao buscar o produto: ${customErrorMessage}`
      );
    });
  });

  describe('add', () => {
    it('must call rpc(create_product) and then getOneById with the new ID', async () => {
      const newProductId = 'new-id-789';
      const params = { name: 'Novo Produto', hasVariants: false } as IProduct;

      mockRpc.mockResolvedValue({ data: newProductId, error: null });
      mockOverrideTypes.mockResolvedValue({
        data: supabaseInputData,
        error: null
      });

      await ProductService.add(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_product', {
        product_data: params
      });
      expect(mockEq).toHaveBeenCalledWith('id', newProductId);
    });

    it('should throw a error if rpc(create_product) fail', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'Permissão negada' }
      });

      await expect(ProductService.add({} as IProduct)).rejects.toThrow(
        'Falha ao criar produto: Permissão negada'
      );
    });
  });

  describe('update', () => {
    it('must call rpc(update_product) and then getOneById', async () => {
      const updatedId = 'p1';
      const params = {
        id: updatedId,
        name: 'Produto Editado',
        hasVariants: true
      } as IProduct;

      mockRpc.mockResolvedValue({ data: updatedId, error: null });

      const getOneByIdSpy = vi
        .spyOn(ProductService, 'getOneById')
        .mockResolvedValue(expectedProductOutput);

      await ProductService.update(params);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_product', {
        product_data: params
      });

      expect(getOneByIdSpy).toHaveBeenCalledWith(updatedId);
    });

    it('should throw a error if rpc(update_product) fail', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'Chave inválida' }
      });

      await expect(ProductService.update({} as IProduct)).rejects.toThrow(
        'Falha ao atualizar produto: Chave inválida'
      );
    });
  });
});
