import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EditProductPage } from './';
import { useParams } from 'react-router';
import { useProductByIDQuery } from '../../hooks/use-query';

const { MockProductForm, MockProductFormProvider } = vi.hoisted(() => ({
  MockProductForm: vi.fn(() => <div data-testid="mock-product-form" />),
  MockProductFormProvider: vi.fn((props) => (
    <div
      data-testid="mock-provider"
      data-mode={props.mode}
      data-product-name={props.product?.name}
    >
      {props.children}
    </div>
  ))
}));

vi.mock('react-router', () => ({
  useParams: vi.fn()
}));

vi.mock('../../hooks/use-query', () => ({
  useProductByIDQuery: vi.fn()
}));

vi.mock('../../components/product-form', () => ({
  ProductForm: MockProductForm
}));

vi.mock('../../components/product-form/hook', () => ({
  ProductFormProvider: MockProductFormProvider
}));

describe('EditProductPage', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockUseQuery = vi.mocked(useProductByIDQuery);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    } as any);
  });

  it('should render null if the productID or data is not loaded', () => {
    mockUseParams.mockReturnValue({ productId: undefined });

    render(<EditProductPage />);

    expect(screen.queryByTestId('mock-provider')).toBeNull();

    mockUseParams.mockReturnValue({ productId: 'p1' });
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<EditProductPage />);

    expect(screen.queryByTestId('mock-provider')).toBeNull();

    expect(mockUseQuery).toHaveBeenCalledWith('p1');
  });

  it('The form should be rendered in "Edit" mode with the product data and dynamic label', () => {
    const mockProduct = {
      id: 'p123',
      name: 'Caneta Esferográfica',
      otherData: '...'
    };

    mockUseParams.mockReturnValue({ productId: 'p123' });
    mockUseQuery.mockReturnValue({
      data: mockProduct,
      isLoading: false
    } as any);

    render(<EditProductPage />);

    expect(
      screen.getByRole('heading', { name: 'Produtos', level: 1 })
    ).toBeInTheDocument();

    expect(MockProductFormProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'Edit',
        product: mockProduct
      }),
      undefined
    );

    expect(MockProductForm).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Editar produto: Caneta Esferográfica'
      }),
      undefined
    );
  });
});
