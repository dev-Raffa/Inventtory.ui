import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useParams, BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetailsPage } from './index';
import { useProductByIDQuery } from '../../hooks/use-query';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn()
  };
});

vi.mock('../../hooks/use-query');

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

vi.mock('@/app/components/ui/carousel', () => ({
  Carousel: ({ children }: any) => (
    <div data-testid="real-carousel">{children}</div>
  ),
  CarouselContent: ({ children }: any) => <div>{children}</div>,
  CarouselItem: ({ children }: any) => <div>{children}</div>,
  CarouselPrevious: () => <button>Prev</button>,
  CarouselNext: () => <button>Next</button>
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProductDetailsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockProductVariant = {
  id: 'p1',
  name: 'Tênis Runner',
  description: 'Tênis de corrida',
  sku: 'RUN-BASE',
  hasVariants: true,
  category: { name: 'Calçados' },
  allImages: [],
  attributes: [{ name: 'Cor', values: 'Azul, Vermelho' }],
  variants: [
    {
      id: 'v1',
      sku: 'RUN-BLUE',
      stock: 50,
      minimumStock: 5,
      options: [{ name: 'Cor', value: 'Azul' }],
      images: [{ id: 'img-blue', src: 'url-blue', isPrimary: true }]
    },
    {
      id: 'v2',
      sku: 'RUN-RED',
      stock: 20,
      minimumStock: 2,
      options: [{ name: 'Cor', value: 'Vermelho' }],
      images: [{ id: 'img-red', src: 'url-red', isPrimary: true }]
    }
  ]
};

describe('ProductDetailsPage (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ productId: 'p1' });
  });

  it('should render loading or error state', () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true
    } as any);

    renderComponent();

    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
  });

  it('should use empty string fallback when productId is undefined', () => {
    vi.mocked(useParams).mockReturnValue({ productId: undefined });
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: undefined,
      isLoading: true
    } as any);

    renderComponent();

    expect(useProductByIDQuery).toHaveBeenCalledWith('');
    expect(screen.getByText('Produto não encontrado')).toBeInTheDocument();
  });

  it('should render simple product details correctly (no variants)', () => {
    const mockProductSimple = {
      id: 'p-simple',
      name: 'Camiseta Lisa',
      sku: 'TEE-SMP',
      hasVariants: false,
      category: { name: 'Roupas' },
      allImages: [{ id: 'img-1', src: 'url-1', isPrimary: true }],
      attributes: [],
      variants: [],
      stock: 100,
      minimumStock: 10
    };

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductSimple,
      isLoading: false
    } as any);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Camiseta Lisa' })
    ).toBeInTheDocument();

    expect(screen.getByText(/TEE-SMP/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render product details and default to first variant', () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductVariant,
      isLoading: false
    } as any);

    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Tênis Runner' })
    ).toBeInTheDocument();

    expect(screen.getByText(/RUN-BLUE/)).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should switch variant data when user selects a different option', async () => {
    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductVariant,
      isLoading: false
    } as any);

    const user = userEvent.setup();

    renderComponent();

    expect(screen.getByText(/RUN-BLUE/)).toBeInTheDocument();

    const redOption = screen.getByRole('button', { name: 'Vermelho' });

    await user.click(redOption);

    expect(screen.getByText(/RUN-RED/)).toBeInTheDocument();
    expect(screen.queryByText(/RUN-BLUE/)).not.toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should handle variant images correctly even if no primary image is defined', () => {
    const mockProductNoPrimary = {
      ...mockProductVariant,
      variants: [
        {
          id: 'v-no-primary',
          sku: 'RUN-NP',
          stock: 10,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Verde' }],
          images: [{ id: 'img-np', src: 'url-np', isPrimary: false }]
        }
      ],
      attributes: [{ name: 'Cor', values: 'Verde' }]
    };

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductNoPrimary,
      isLoading: false
    } as any);

    renderComponent();

    expect(screen.getByText(/RUN-NP/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
  });

  it('should correctly identify primary image when it is NOT the first one in the list', () => {
    const mockProductMultiImages = {
      ...mockProductVariant,
      variants: [
        {
          id: 'v-multi',
          sku: 'RUN-MULTI',
          stock: 10,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Roxo' }],
          images: [
            { id: 'img-1', src: 'url-1', isPrimary: false },
            { id: 'img-2', src: 'url-2', isPrimary: true }
          ]
        }
      ],
      attributes: [{ name: 'Cor', values: 'Roxo' }]
    };

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductMultiImages,
      isLoading: false
    } as any);

    renderComponent();

    expect(screen.getByText(/RUN-MULTI/)).toBeInTheDocument();
    expect(screen.getByTestId('real-carousel')).toBeInTheDocument();
  });

  it('should handle variant with empty images array gracefully', () => {
    const mockProductEmptyImages = {
      ...mockProductVariant,
      variants: [
        {
          id: 'v-empty',
          sku: 'RUN-EMPTY',
          stock: 5,
          minimumStock: 1,
          options: [{ name: 'Cor', value: 'Cinza' }],
          images: []
        }
      ],
      attributes: [{ name: 'Cor', values: 'Cinza' }]
    };

    vi.mocked(useProductByIDQuery).mockReturnValue({
      data: mockProductEmptyImages,
      isLoading: false
    } as any);

    renderComponent();

    expect(screen.getByText(/RUN-EMPTY/)).toBeInTheDocument();
  });
});
