import { describe, it, expect } from 'vitest';
import { getVariantImages } from './';
import type { IProductImage } from '../types';

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
    expect(result[1].id).toBe('imgB');
    expect(result[1].isPrimary).toBe(false);
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
});
