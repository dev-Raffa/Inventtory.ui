import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProductProvider } from '../../mocks';
import { ProductSummary } from './';
import userEvent from '@testing-library/user-event';
import type { ProductFormProviderProps } from '../../hook';
import type { IProduct } from '@/app/features/products/types/models';

const {
  MockBasicInfosCard,
  MockInventoryCard,
  MockImageCarousel,
  MockOptionsSelect
} = vi.hoisted(() => ({
  MockBasicInfosCard: vi.fn(() => <div data-testid="basic-infos">Infos</div>),
  MockInventoryCard: vi.fn(() => <div data-testid="inventory">Inventory</div>),
  MockImageCarousel: vi.fn(() => <div data-testid="carousel">Carousel</div>),
  MockOptionsSelect: vi.fn(({ handleSelectOption, attributes }) => (
    <div data-testid="options-select">
      {attributes.map((attr: any) => (
        <div key={attr.name}>
          {attr.values.split(',').map((val: string) => {
            const value = val.trim();
            return (
              <button
                key={value}
                onClick={() => handleSelectOption(attr.name, value)}
                aria-label={`Select ${attr.name} ${value}`}
              >
                {value}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  ))
}));

vi.mock('../../../product-basic-infos-card', () => ({
  ProductBasicInfosCard: MockBasicInfosCard
}));
vi.mock('../../../product-inventtory-card', () => ({
  ProductInventtoryCard: MockInventoryCard
}));
vi.mock('../../../product-image-carousel', () => ({
  ProductImageCarousel: MockImageCarousel
}));
vi.mock('../../../product-options-select', () => ({
  ProductOptionsSelect: MockOptionsSelect
}));

const mockSimpleProduct = {
  name: 'Produto Simples',
  sku: 'SKU-SIMPLES',
  stock: 10,
  minimumStock: 2,
  hasVariants: false,
  allImages: [{ id: 'img1', src: 'url1', isPrimary: true }]
};

const mockVariableProduct: IProduct = {
  name: 'Produto Variável',
  category: { id: 'cat-1', name: 'teste' },
  sku: 'SKU-GLOBAL',
  hasVariants: true,
  attributes: [{ name: 'Cor', values: 'Azul, Vermelho' }],
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
      name: 'image-azul'
    }
  ]
};

describe('ProductSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display global data for a product WITHOUT variants.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      //@ts-expect-error product
      product: mockSimpleProduct,
      mode: 'View'
    };

    renderWithProductProvider(<ProductSummary />, { providerProps });

    const pastPropsToBasicInfosCard = MockBasicInfosCard.mock.calls[0];
    const pastPropsToInventoryCard = MockInventoryCard.mock.calls[0];
    const pastPropsToImageCarousel = MockImageCarousel.mock.calls[0];

    expect(pastPropsToBasicInfosCard).toEqual([
      expect.objectContaining({
        name: mockSimpleProduct.name,
        description: '',
        category: {},
        sku: mockSimpleProduct.sku
      }),
      undefined
    ]);

    expect(pastPropsToInventoryCard).toEqual([
      expect.objectContaining({
        stock: mockSimpleProduct.stock,
        minimumStock: mockSimpleProduct.minimumStock
      }),
      undefined
    ]);

    expect(pastPropsToImageCarousel).toEqual([
      expect.objectContaining({
        images: mockSimpleProduct.allImages
      }),
      undefined
    ]);

    expect(screen.queryByTestId('options-select')).not.toBeInTheDocument();
  });

  it('should display data from the default variant (first option) when loading a product WITH variants.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      product: mockVariableProduct
    };

    renderWithProductProvider(<ProductSummary />, { providerProps });

    const expectedVariant = mockVariableProduct.variants[0];

    const pastPropsToBasicInfosCard = MockBasicInfosCard.mock.calls[0];
    const pastPropsToInventoryCard = MockInventoryCard.mock.calls[0];
    const pastPropsToImageCarousel = MockImageCarousel.mock.calls[0];

    expect(pastPropsToBasicInfosCard).toEqual([
      expect.objectContaining({
        sku: expectedVariant.sku
      }),
      undefined
    ]);

    expect(pastPropsToInventoryCard).toEqual([
      expect.objectContaining({
        stock: expectedVariant.stock
      }),
      undefined
    ]);

    const expectedImages = [expect.objectContaining({ id: 'img-azul' })];

    expect(pastPropsToImageCarousel).toEqual([
      expect.objectContaining({
        images: expect.arrayContaining(expectedImages)
      }),
      undefined
    ]);
  });

  it('must update the SKU, Stock, and Images when selecting a different variant.', async () => {
    const user = userEvent.setup();
    const providerProps = {
      product: mockVariableProduct
    };

    renderWithProductProvider(<ProductSummary />, { providerProps });

    MockBasicInfosCard.mockClear();
    MockInventoryCard.mockClear();
    MockImageCarousel.mockClear();

    const redButton = screen.getByRole('button', {
      name: /Select Cor Vermelho/i
    });
    await user.click(redButton);

    const redVariant = mockVariableProduct.variants[1];

    const pastPropsToBasicInfosCard = MockBasicInfosCard.mock.calls[0];
    const pastPropsToInventoryCard = MockInventoryCard.mock.calls[0];
    const pastPropsToImageCarousel = MockImageCarousel.mock.calls[0];

    expect(pastPropsToBasicInfosCard).toEqual([
      expect.objectContaining({ sku: redVariant.sku }),
      undefined
    ]);

    expect(pastPropsToInventoryCard).toEqual([
      expect.objectContaining({ stock: redVariant.stock }),
      undefined
    ]);

    expect(pastPropsToImageCarousel).toEqual([
      expect.objectContaining({ images: [] }),
      undefined
    ]);
  });
});
