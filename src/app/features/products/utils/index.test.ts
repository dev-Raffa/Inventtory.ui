import { describe, it, expect } from 'vitest';
import {
  getVariantImages,
  formatVariantOptions,
  getProductStockStatus
} from './index';
import type { IProductImage } from '../types/models';

const allImagesMock: IProductImage[] = [
  {
    id: 'imgA',
    name: 'A',
    isPrimary: false,
    publicId: 'pa',
    src: 'http:imgA',
    type: 'image'
  },
  {
    id: 'imgB',
    name: 'B',
    isPrimary: true,
    publicId: 'pb',
    src: 'http:imgB',
    type: 'image'
  },
  {
    id: 'imgC',
    name: 'C',
    isPrimary: false,
    publicId: 'pc',
    src: 'http:imgC',
    type: 'image'
  },
  {
    id: 'imgD',
    name: 'D',
    isPrimary: false,
    publicId: 'pd',
    src: 'http:imgD',
    type: 'image'
  }
];

describe('getVariantImages', () => {
  it('should return undefined if allImages is undefined', () => {
    const result = getVariantImages({
      allImages: undefined,
      variantImagesId: new Set(['imgA'])
    });
    expect(result).toBeUndefined();
  });

  it('must filter the correct images, set the primary image, and sort them', () => {
    const variantIds = new Set(['imgB', 'imgC', 'imgD']);
    const primaryId = 'imgC';

    const result =
      getVariantImages({
        allImages: allImagesMock,
        variantImagesId: variantIds,
        primaryImageVariantId: primaryId
      }) || [];

    expect(result).toHaveLength(3);
    expect(result.some((img) => img.id === 'imgA')).toBe(false);

    expect(result[0].id).toBe('imgC');
    expect(result[0].isPrimary).toBe(true);

    const secondaryImages = result.slice(1);
    expect(secondaryImages.every((img) => !img.isPrimary)).toBe(true);
  });

  it('All images should be kept as secondary if primaryImageVariantId is null', () => {
    const variantIds = new Set(['imgB', 'imgC']);

    const result = getVariantImages({
      allImages: allImagesMock,
      variantImagesId: variantIds,
      primaryImageVariantId: undefined
    });

    expect(result).toHaveLength(2);
    expect(result?.every((img) => img.isPrimary === false)).toBe(true);
  });

  it('should sort correctly when the primary image is originally at the end of the list', () => {
    const variantIds = new Set(['imgA', 'imgB']);
    const primaryId = 'imgB';

    const result =
      getVariantImages({
        allImages: allImagesMock,
        variantImagesId: variantIds,
        primaryImageVariantId: primaryId
      }) || [];

    expect(result[0].id).toBe('imgB');
    expect(result[1].id).toBe('imgA');
  });
});

describe('formatVariantOptions', () => {
  it('should join multiple options with " / " separator', () => {
    const options = [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'G' }
    ];
    const result = formatVariantOptions(options);
    expect(result).toBe('Cor: Azul / Tamanho: G');
  });

  it('should format a single option correctly', () => {
    const options = [{ name: 'Voltagem', value: '220v' }];
    const result = formatVariantOptions(options);
    expect(result).toBe('Voltagem: 220v');
  });

  it('should return empty string for empty options array', () => {
    const result = formatVariantOptions([]);
    expect(result).toBe('');
  });
});

describe('getProductStockStatus', () => {
  it('should return "critical" when stock is 0', () => {
    expect(getProductStockStatus(0, 10)).toBe('critical');
    expect(getProductStockStatus(0, undefined)).toBe('critical');
  });

  it('should return "critical" when stock is less than or equal to minimum', () => {
    expect(getProductStockStatus(5, 10)).toBe('critical');
    expect(getProductStockStatus(10, 10)).toBe('critical');
  });

  it('should return "warning" when stock is slightly above minimum (<= 1.25x)', () => {
    expect(getProductStockStatus(12, 10)).toBe('warning');
    expect(getProductStockStatus(12.5, 10)).toBe('warning');
  });

  it('should return "healthy" when stock is safe (> 1.25x)', () => {
    expect(getProductStockStatus(13, 10)).toBe('healthy');
  });

  it('should return "healthy" when minimumStock is undefined and stock > 0', () => {
    expect(getProductStockStatus(50, undefined)).toBe('healthy');
  });
});
