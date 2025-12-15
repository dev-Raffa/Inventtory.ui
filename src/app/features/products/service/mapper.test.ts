import { describe, it, expect } from 'vitest';
import { ProductMapper } from './mapper';
import type { ProductDTO } from '../types/dto';

describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('should map a simple product without variants correctly', () => {
      const dto: ProductDTO = {
        id: 'prod-1',
        name: 'Camiseta Básica',
        sku: 'TSHIRT-001',
        description: 'Uma camiseta legal',
        stock: 100,
        minimum_stock: 10,
        has_variants: false,
        categories: { id: 'cat-1', name: 'Roupas' },
        product_attributes: [],
        product_images: [
          {
            id: 'img-1',
            name: 'front.jpg',
            src: 'url-front',
            public_id: 'pid-1',
            type: 'image',
            is_primary: true
          }
        ],
        product_variants: []
      };

      const result = ProductMapper.toDomain(dto);

      expect(result.hasVariants).toBe(false);
      expect(result.category).toEqual({ id: 'cat-1', name: 'Roupas' });
      expect(result.allImages).toHaveLength(1);
      expect(result.allImages?.[0].isPrimary).toBe(true);
      expect(result.attributes).toEqual([]);
    });

    it('should map a product with variants correctly', () => {
      const dto: ProductDTO = {
        id: 'prod-2',
        name: 'Tênis Sport',
        sku: 'SNEAKER-001',
        stock: 50,
        minimum_stock: 5,
        has_variants: true,
        categories: { id: 'cat-2', name: 'Calçados' },
        product_attributes: [{ name: 'Tamanho', values: '38, 39, 40' }],
        product_images: [],
        product_variants: [
          {
            id: 'var-1',
            sku: 'SNEAKER-38',
            stock: 20,
            minimum_stock: 2,
            options: [{ name: 'Tamanho', value: '38' }],
            variant_images: [
              { image_id: 'img-var-1', is_primary: true },
              { image_id: 'img-var-2', is_primary: false }
            ]
          }
        ]
      };

      const result = ProductMapper.toDomain(dto);

      expect(result.hasVariants).toBe(true);
      if (result.hasVariants) {
        expect(result.variants).toHaveLength(1);
        expect(result.variants[0].sku).toBe('SNEAKER-38');
        expect(result.variants[0].images[0].isPrimary).toBe(true);
      }
    });

    it('should throw error if category is missing', () => {
      const dto: ProductDTO = {
        id: 'prod-orphan',
        name: 'Produto Órfão',
        sku: 'ORPHAN',
        stock: 0,
        minimum_stock: 0,
        has_variants: false,
        categories: null as any,
        product_attributes: [],
        product_images: [],
        product_variants: []
      };

      expect(() => ProductMapper.toDomain(dto)).toThrow(
        'Inconsistência de dados: O produto "Produto Órfão" (ID: prod-orphan) não possui categoria vinculada.'
      );
    });

    it('should handle undefined lists gracefully', () => {
      const dto: ProductDTO = {
        id: 'prod-4',
        name: 'Produto Vazio',
        sku: 'EMPTY',
        stock: 0,
        minimum_stock: 0,
        has_variants: false,
        categories: { id: 'cat-1', name: 'Roupas' },
        product_attributes: undefined as any,
        product_images: undefined as any,
        product_variants: undefined as any
      };

      const result = ProductMapper.toDomain(dto);

      expect(result.attributes).toEqual([]);
      expect(result.allImages).toBeUndefined();
    });

    it('should sort variant images putting primary first', () => {
      const dto: any = {
        categories: { id: 'c', name: 'n' },
        has_variants: true,
        product_variants: [
          {
            variant_images: [
              { image_id: '1', is_primary: false },
              { image_id: '2', is_primary: true },
              { image_id: '3', is_primary: false }
            ]
          }
        ]
      };

      const result = ProductMapper.toDomain(dto);
      if (result.hasVariants) {
        expect(result.variants[0].images[0].id).toBe('2');
      }
    });
  });
});
