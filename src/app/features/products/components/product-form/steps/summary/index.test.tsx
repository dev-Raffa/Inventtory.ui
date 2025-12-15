import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProductProvider } from '../../mocks';
import { ProductSummary } from './';
import userEvent from '@testing-library/user-event';
import type { IProduct } from '@/app/features/products/types/models';

const mocks = vi.hoisted(() => ({
  BasicInfosCard: vi.fn(),
  InventoryCard: vi.fn(),
  ImageCarousel: vi.fn(),
  OptionsSelect: vi.fn(({ handleSelectOption, attributes }) => (
    <div data-testid="options-select-mock">
      {attributes.map((attr: any) => (
        <div key={attr.name}>
          {attr.values.split(',').map((val: string) => (
            <button
              key={val.trim()}
              onClick={() => handleSelectOption(attr.name, val.trim())}
              aria-label={`Select ${val.trim()}`}
            >
              {val.trim()}
            </button>
          ))}
        </div>
      ))}
    </div>
  ))
}));

vi.mock('../../../product-basic-infos-card', () => ({
  ProductBasicInfosCard: mocks.BasicInfosCard
}));

vi.mock('../../../product-inventtory-card', () => ({
  ProductInventtoryCard: mocks.InventoryCard
}));

vi.mock('../../../product-image-carousel', () => ({
  ProductImageCarousel: mocks.ImageCarousel
}));

vi.mock('../../../product-options-select', () => ({
  ProductOptionsSelect: mocks.OptionsSelect
}));

const mockSimpleProduct = {
  name: 'Produto Simples',
  sku: 'SKU-SIMPLES',
  stock: 10,
  minimumStock: 2,
  hasVariants: false,
  allImages: [
    { id: 'img1', src: 'url1', isPrimary: true, type: 'image', name: 'img1' }
  ],
  attributes: [],
  variants: [],
  category: { id: '1', name: 'Geral' }
} as unknown as IProduct;

const mockVariableProduct: IProduct = {
  name: 'Produto Variável',
  category: { id: 'cat-1', name: 'teste' },
  sku: 'SKU-GLOBAL',
  hasVariants: true,
  attributes: [{ name: 'Cor', values: 'Azul, Vermelho' }],
  stock: 0,
  minimumStock: 0,
  variants: [
    {
      id: 'var1',
      sku: 'SKU-AZUL',
      stock: 5,
      minimumStock: 1,
      options: [{ name: 'Cor', value: 'Azul' }],
      images: [{ id: 'img-azul', isPrimary: true }]
    },
    {
      id: 'var2',
      sku: 'SKU-VERMELHO',
      stock: 8,
      minimumStock: 3,
      options: [{ name: 'Cor', value: 'Vermelho' }],
      images: []
    }
  ],
  allImages: [
    {
      id: 'img-azul',
      src: 'url-azul',
      isPrimary: false,
      type: 'image',
      name: 'image-azul'
    },
    {
      id: 'img-extra',
      src: 'url-extra',
      isPrimary: false,
      type: 'image',
      name: 'image-extra'
    }
  ]
};

describe('ProductSummary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass correct global data to child components for a Simple Product', () => {
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockSimpleProduct, mode: 'View' }
    });

    expect(mocks.BasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockSimpleProduct.name,
        sku: mockSimpleProduct.sku
      }),
      undefined
    );

    expect(mocks.InventoryCard).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: mockSimpleProduct.stock,
        minimumStock: mockSimpleProduct.minimumStock
      }),
      undefined
    );

    expect(mocks.ImageCarousel).toHaveBeenCalledWith(
      expect.objectContaining({
        images: mockSimpleProduct.allImages
      }),
      undefined
    );

    expect(screen.queryByTestId('options-select-mock')).not.toBeInTheDocument();
  });

  it('should handle product without images gracefully', () => {
    const productNoImages = { ...mockSimpleProduct, allImages: undefined };

    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: productNoImages, mode: 'View' }
    });

    expect(mocks.ImageCarousel).not.toHaveBeenCalled();
    expect(screen.getByText('Sem imagens')).toBeInTheDocument();
  });

  it('should initialize with the first variant selected for a Variable Product', () => {
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockVariableProduct, mode: 'View' }
    });

    const expectedVariant = mockVariableProduct.variants![0];

    expect(mocks.BasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({ sku: expectedVariant.sku }),
      undefined
    );

    expect(mocks.InventoryCard).toHaveBeenCalledWith(
      expect.objectContaining({ stock: expectedVariant.stock }),
      undefined
    );

    expect(mocks.ImageCarousel).toHaveBeenCalledWith(
      expect.objectContaining({
        images: expect.arrayContaining([
          expect.objectContaining({ id: 'img-azul' })
        ])
      }),
      undefined
    );
  });

  it('should sort variant images putting primary first', () => {
    const mockUnsortedImagesProduct: IProduct = {
      ...mockVariableProduct,
      variants: [
        {
          id: 'v1',
          sku: 'SKU-SORT',
          stock: 10,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Azul' }],
          images: [
            { id: 'img-3', isPrimary: false },
            { id: 'img-2', isPrimary: true },
            { id: 'img-1', isPrimary: false }
          ]
        }
      ],
      allImages: [
        { id: 'img-1', src: 'u1', type: 'image', name: 'n1', isPrimary: false },
        { id: 'img-2', src: 'u2', type: 'image', name: 'n2', isPrimary: true },
        { id: 'img-3', src: 'u3', type: 'image', name: 'n3', isPrimary: false }
      ]
    };

    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockUnsortedImagesProduct, mode: 'View' }
    });

    const calledImages = mocks.ImageCarousel.mock.calls[0][0].images;

    expect(calledImages[0].id).toBe('img-2');
    expect(calledImages.length).toBe(3);
  });

  it('should update displayed data when user selects a different variant', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductSummary />, {
      providerProps: { product: mockVariableProduct, mode: 'View' }
    });

    mocks.BasicInfosCard.mockClear();
    mocks.InventoryCard.mockClear();
    mocks.ImageCarousel.mockClear();

    const redButton = screen.getByRole('button', { name: /Vermelho/i });

    await user.click(redButton);

    const redVariant = mockVariableProduct.variants![1];

    expect(mocks.BasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({ sku: redVariant.sku }),
      undefined
    );

    expect(mocks.InventoryCard).toHaveBeenCalledWith(
      expect.objectContaining({ stock: redVariant.stock }),
      undefined
    );

    expect(mocks.ImageCarousel).not.toHaveBeenCalled();
    expect(screen.getByText('Sem imagens')).toBeInTheDocument();
  });
});
