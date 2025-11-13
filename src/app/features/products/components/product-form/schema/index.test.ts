import { describe, it, expect } from 'vitest';
import { productSchema } from '.';

const getValidMockData = () => ({
  name: 'Produto Válido',
  description: 'Descrição...',
  sku: 'SKU-123',
  category: { id: 'cat-1', name: 'Categoria 1' },
  stock: 100,
  minimumStock: 10,
  hasVariants: true,
  allImages: [
    {
      id: 'img1',
      src: 'blob:http://...',
      name: 'imagem1.jpg',
      file: new File([''], 'imagem1.jpg'),
      isPrimary: true,
      type: 'image'
    }
  ],
  attributes: [
    {
      name: 'Cor',
      values: 'Azul, Verde'
    }
  ],
  variants: [
    {
      id: 'v1',
      sku: 'SKU-123-AZ',
      options: [{ name: 'Cor', value: 'Azul' }],
      stock: 50,
      minimumStock: 5,
      images: []
    }
  ]
});

describe('productFormSchema (Zod)', () => {
  it('must validate a complete and correct product.', () => {
    const data = getValidMockData();
    const result = productSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('should pass if hasVariants: false and the variant/attribute arrays are empty.', () => {
    const data = getValidMockData();

    data.hasVariants = false;

    const result = productSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('should fail if the name is empty.', () => {
    const data = getValidMockData();

    data.name = '';

    const result = productSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(
      'Nome deve ter no mínimo 3 caracteres.'
    );
  });

  it('should fail if the sku is empty.', () => {
    const data = getValidMockData();

    data.sku = '';

    const result = productSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('obrigatório');
  });

  it('should fail if hasVariants: true and the "attributes" or array is empty.', () => {
    const data = getValidMockData();

    data.hasVariants = true;
    data.attributes = [];

    const result = productSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(
      'Deve conter pelo menos um atributo'
    );
  });

  it('should fail if hasVariants: true and the "variants" array is empty.', () => {
    const data = getValidMockData();

    data.hasVariants = true;
    data.variants = [];

    const result = productSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(
      'Deve conter pelo menos uma variante'
    );
  });
});
