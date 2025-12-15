import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EditProductPage } from './index';
import { useParams, BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProductByIDQuery,
  useProductUpdateMutation,
  useProductCreateMutation
} from '../../hooks/use-query';
import {
  useCategoriesQuery,
  useCreateCategoryMutation
} from '../../../category/hooks/use-query';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn()
  };
});

vi.mock('../../hooks/use-query');
vi.mock('../../../category/hooks/use-query');
vi.mock('@/app/services/image-upload');

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.PointerEvent = MouseEvent as typeof PointerEvent;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EditProductPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EditProductPage (Integration)', () => {
  const mockProduct = {
    id: 'p123',
    name: 'Caneta Luxo',
    sku: 'PEN-LUX-01',
    description: 'Caneta esferográfica dourada',
    stock: 100,
    minimumStock: 10,
    hasVariants: false,
    category: { id: 'cat1', name: 'Escritório' },
    attributes: [],
    variants: [],
    allImages: []
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any);

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: [{ id: 'cat1', name: 'Escritório' }],
      isLoading: false,
      isError: false
    } as any);

    vi.mocked(useProductUpdateMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);

    vi.mocked(useProductCreateMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);

    vi.mocked(useCreateCategoryMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);
  });

  it('should render loading state initially or null if ID is missing', () => {
    vi.mocked(useParams).mockReturnValue({ productId: undefined });

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });

  it('should populate the real form with product data fetched by ID', async () => {
    vi.mocked(useParams).mockReturnValue({ productId: 'p123' });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false
    } as any);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: /Produtos/i })
    ).toBeInTheDocument();

    expect(screen.getByText('Editar produto: Caneta Luxo')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Caneta Luxo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PEN-LUX-01')).toBeInTheDocument();
    });
  });

  it('should display graceful handling (empty state) when product is not found', () => {
    vi.mocked(useParams).mockReturnValue({ productId: 'p999' });

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    } as any);

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });
});
