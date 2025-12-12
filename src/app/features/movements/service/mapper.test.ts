import { describe, it, expect } from 'vitest';
import { MovementMapper } from './mapper';
import type { MovementDTO } from '../types/dto';
import type { Movement } from '../types/model';

describe('MovementMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain model correctly with variant image', () => {
      const dto: MovementDTO = {
        id: '1',
        date: '2023-10-01T10:00:00Z',
        type: 'entry',
        reason: 'Restock',
        document_number: 'DOC-001',
        total_quantity: 10,
        profiles: {
          full_name: 'John Doe',
          avatar_url: 'avatar.jpg'
        },
        movement_items: [
          {
            id: 'item-1',
            quantity: 5,
            current_stock: 50,
            product_id: 'prod-1',
            products: {
              name: 'T-Shirt',
              product_images: []
            },
            variant_id: 'var-1',
            product_variants: {
              options: [{ name: 'Color', value: 'Blue' }],
              variant_images: [
                {
                  is_primary: true,
                  product_images: { src: 'blue-shirt.jpg' }
                }
              ]
            }
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.id).toBe(dto.id);
      expect(result.user.name).toBe(dto.profiles?.full_name);
      expect(result.items[0].productImage).toBe('blue-shirt.jpg');
      expect(result.items[0].variantAttributes).toBe('Blue');
    });

    it('should fallback to product primary image if variant has no image', () => {
      const dto: MovementDTO = {
        id: '2',
        date: '2023-10-02T10:00:00Z',
        type: 'withdrawal',
        reason: 'Sale',
        document_number: null,
        total_quantity: 1,
        profiles: null,
        movement_items: [
          {
            id: 'item-2',
            quantity: 1,
            current_stock: 10,
            product_id: 'prod-2',
            products: {
              name: 'Cap',
              product_images: [
                { src: 'cap-back.jpg', is_primary: false },
                { src: 'cap-front.jpg', is_primary: true }
              ]
            },
            variant_id: undefined,
            product_variants: undefined
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].productImage).toBe('cap-front.jpg');
      expect(result.user.name).toBe('Desconhecido');
      expect(result.user.initials).toBe('DE');
    });

    it('should fallback to product image if variant exists but has no primary image', () => {
      const dto: MovementDTO = {
        id: '3',
        date: '2023-10-03',
        type: 'entry',
        reason: 'Check',
        total_quantity: 1,
        document_number: null,
        profiles: { full_name: 'Tester' },
        movement_items: [
          {
            id: 'item-3',
            quantity: 1,
            current_stock: 5,
            product_id: 'prod-3',
            products: {
              name: 'Pants',
              product_images: [{ src: 'pants-main.jpg', is_primary: true }]
            },
            variant_id: 'var-3',
            product_variants: {
              options: [],
              variant_images: [
                {
                  is_primary: false,
                  product_images: { src: 'pants-var-side.jpg' }
                }
              ]
            }
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].productImage).toBe('pants-main.jpg');
    });

    it('should fallback to the first product image if no primary image is found', () => {
      const dto: MovementDTO = {
        id: '4',
        date: '2023-10-04',
        type: 'entry',
        reason: 'Test',
        document_number: null,
        total_quantity: 1,
        profiles: { full_name: 'Tester' },
        movement_items: [
          {
            id: 'item-4',
            quantity: 1,
            current_stock: 5,
            product_id: 'prod-3',
            products: {
              name: 'Bag',
              product_images: [
                { src: 'bag-1.jpg', is_primary: false },
                { src: 'bag-2.jpg', is_primary: false }
              ]
            },
            variant_id: undefined,
            product_variants: undefined
          }
        ]
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.items[0].productImage).toBe('bag-1.jpg');
    });

    it('should return fallback initials "US" for whitespace-only names', () => {
      const dto: MovementDTO = {
        id: '5',
        date: '2023-10-05',
        type: 'entry',
        reason: 'Test',
        total_quantity: 1,
        document_number: null,
        profiles: { full_name: '   ' },
        movement_items: []
      };

      const result = MovementMapper.toDomain(dto);

      expect(result.user.initials).toBe('US');
    });
  });

  describe('toPersistence', () => {
    it('should map domain model to RPC arguments correctly', () => {
      const domainModel: Movement = {
        date: new Date('2023-12-25'),
        type: 'adjustment',
        reason: 'Inventory Check',
        totalQuantity: 5,
        items: [
          {
            productId: 'prod-1',
            productName: 'Item 1',
            currentStock: 10,
            quantity: 5,
            variantId: 'var-1'
          }
        ]
      };

      const result = MovementMapper.toPersistence(domainModel);

      expect(result.payload.type).toBe('adjustment');
      expect(result.payload.reason).toBe('Inventory Check');
      expect(result.payload.items[0].product_id).toBe('prod-1');
    });
  });
});
