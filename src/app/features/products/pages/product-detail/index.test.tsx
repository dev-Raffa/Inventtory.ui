import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProductDetailsPage } from './';
import { useParams } from 'react-router';
import { useProductByIDQuery } from '../../hooks/use-query';

const {
  MockBasicInfosCard,
  MockGetVariantImages,
  MockImageCarousel,
  MockInventoryCard,
  MockOptionsSelect
} = vi.hoisted(() => ({
  MockImageCarousel: vi.fn(() => <div data-testid="mock-carousel" />),
  MockBasicInfosCard: vi.fn(() => <div data-testid="mock-info-card" />),
  MockOptionsSelect: vi.fn(({ handleSelectOption }) => (
    <button
      data-testid="mock-select-option"
      onClick={() => handleSelectOption('Cor', 'Vermelho')}
    >
      Select Option
    </button>
  )),
  MockInventoryCard: vi.fn(() => <div data-testid="mock-inventory-card" />),
  MockGetVariantImages: vi.fn()
}));

vi.mock('react-router', () => ({
  useParams: vi.fn()
}));

vi.mock('../../hooks/use-query', () => ({
  useProductByIDQuery: vi.fn()
}));

vi.mock('../../utils', () => ({
  getVariantImages: MockGetVariantImages
}));

vi.mock('../../components/product-image-carousel', () => ({
  ProductImageCarousel: MockImageCarousel
}));

vi.mock('../../components/product-basic-infos-card', () => ({
  ProductBasicInfosCard: MockBasicInfosCard
}));

vi.mock('../../components/product-options-select', () => ({
  ProductOptionsSelect: MockOptionsSelect
}));

vi.mock('../../components/product-inventtory-card', () => ({
  ProductInventtoryCard: MockInventoryCard
}));

const mockProductId = 'p-123';
const mockProductSimple = {
  id: mockProductId,
  name: 'Simple Tee',
  description: 'Cotton T-shirt',
  sku: 'TS-001',
  hasVariants: false,
  category: { name: 'Roupas' },
  allImages: [{ id: 'i1', src: 'blob' }],
  attributes: [],
  variants: [],
  minimumStock: 5,
  stock: 10
};

const mockProductVariant = {
  ...mockProductSimple,
  hasVariants: true,
  attributes: [{ name: 'Cor', values: 'Vermelho, Azul' }],
  variants: [
    {
      sku: 'TS-RED',
      stock: 12,
      minimumStock: 3,
      options: [{ name: 'Cor', value: 'Vermelho' }],
      images: [{ id: 'i2', isPrimary: true }]
    },
    {
      sku: 'TS-BLUE',
      stock: 8,
      minimumStock: 2,
      options: [{ name: 'Cor', value: 'Azul' }],
      images: [{ id: 'i3', isPrimary: true }]
    }
  ]
};

const mockUseParams = vi.mocked(useParams);
const mockUseQuery = vi.mocked(useProductByIDQuery);

describe('ProductDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: mockProductSimple,
      isLoading: false
    } as any);
    mockUseParams.mockReturnValue({ productId: mockProductId });

    MockGetVariantImages.mockReturnValue([{ id: 'i2', src: 'url-2' }]);
  });

  it('should render "Produto não encontrado" when product data is loading or missing', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<ProductDetailsPage />);

    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-info-card')).not.toBeInTheDocument();
  });

  it('should display basic info and global images for a SIMPLE product', () => {
    render(<ProductDetailsPage />);

    expect(screen.getByText('Detalhes do produto')).toBeInTheDocument();
    expect(screen.getByText(mockProductSimple.name)).toBeInTheDocument();

    expect(MockBasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({ sku: mockProductSimple.sku }),
      undefined
    );

    expect(MockImageCarousel).toHaveBeenCalledWith(
      expect.objectContaining({ images: mockProductSimple.allImages }),
      undefined
    );

    expect(screen.queryByTestId('mock-select-option')).not.toBeInTheDocument();

    expect(MockInventoryCard).toHaveBeenCalledWith(
      expect.objectContaining({ stock: mockProductSimple.stock }),
      undefined
    );
  });

  it('should initialize selectedOptions with the first variant on mount (useEffect)', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProductVariant,
      isLoading: false
    } as any);

    const user = userEvent.setup();

    render(<ProductDetailsPage />);

    expect(screen.getByTestId('mock-select-option')).toBeInTheDocument();

    const selectButton = screen.getByTestId('mock-select-option');

    await act(async () => {
      await user.click(selectButton);
    });

    expect(MockBasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'TS-RED' }),
      undefined
    );
  });

  it('should update SKU, Stock, and Carousel images on variant selection (useMemo logic)', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProductVariant,
      isLoading: false
    } as any);

    const expectedBlueVariantImage = {
      id: 'i3',
      name: 'Blue Image',
      src: 'url-blue'
    };

    MockGetVariantImages.mockReturnValueOnce([{ id: 'i2', src: 'url-2' }]);
    MockGetVariantImages.mockReturnValue([expectedBlueVariantImage]);
    MockGetVariantImages.mockClear();

    render(<ProductDetailsPage />);

    expect(MockBasicInfosCard).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'TS-RED' }),
      undefined
    );

    const optionsSelectProps = MockOptionsSelect.mock.calls[0][0];
    const handleSelectOption = optionsSelectProps.handleSelectOption;

    await act(async () => {
      handleSelectOption('Cor', 'Azul');
    });

    expect(MockBasicInfosCard).toHaveBeenLastCalledWith(
      expect.objectContaining({ sku: 'TS-BLUE' }),
      undefined
    );

    expect(MockInventoryCard).toHaveBeenLastCalledWith(
      expect.objectContaining({ stock: 8 }),
      undefined
    );

    expect(MockGetVariantImages).toHaveBeenCalledTimes(3);
    expect(MockImageCarousel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        images: expect.arrayContaining([expect.objectContaining({ id: 'i3' })])
      }),
      undefined
    );
  });
});
