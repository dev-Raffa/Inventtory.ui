import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { ProductListTable } from './index';
import { useProductsQuery } from '../../hooks/use-query';
import type { IProduct } from '../../types/models';

vi.mock('../../hooks/use-query');

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

const mockProducts: IProduct[] = [
  {
    id: 'prod-1',
    name: 'Camiseta Básica',
    sku: 'TSHIRT-001',
    description: '100% Algodão',
    stock: 50,
    minimumStock: 10,
    hasVariants: false,
    category: { id: 'cat-1', name: 'Roupas' },
    attributes: [],
    allImages: []
  },
  {
    id: 'prod-2',
    name: 'Tênis Esportivo',
    sku: 'SNEAKER-X',
    stock: 20,
    minimumStock: 5,
    hasVariants: true,
    category: { id: 'cat-2', name: 'Calçados' },
    attributes: [{ name: 'Tamanho', values: '40, 41' }],
    variants: [
      {
        id: 'var-1',
        sku: 'SNEAKER-X-40',
        stock: 10,
        minimumStock: 2,
        options: [{ name: 'Tamanho', value: '40' }],
        images: []
      },
      {
        id: 'var-2',
        sku: 'SNEAKER-X-41',
        stock: 10,
        minimumStock: 2,
        options: [{ name: 'Tamanho', value: '41' }],
        images: []
      }
    ],
    allImages: []
  }
];

const renderWithProviders = (ui: ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProductListTable (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the table with products returned by the query', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null
    } as any);

    renderWithProviders(<ProductListTable />);

    expect(screen.getByText('Camiseta Básica')).toBeInTheDocument();
    expect(screen.getByText('Tênis Esportivo')).toBeInTheDocument();
    expect(screen.getByText('TSHIRT-001')).toBeInTheDocument();
    expect(screen.getByText('SNEAKER-X')).toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeInTheDocument();
    expect(screen.getByText('Calçados')).toBeInTheDocument();
  });

  it('should display "Nenhum produto foi encontrado." message when the list is empty', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    } as any);

    renderWithProviders(<ProductListTable />);

    expect(
      screen.getByText('Nenhum produto foi encontrado.')
    ).toBeInTheDocument();
  });

  it('should handle loading state gracefully', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any);

    renderWithProviders(<ProductListTable />);

    expect(screen.queryByText('Camiseta Básica')).not.toBeInTheDocument();
  });

  it('should render specific columns correctly', () => {
    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false
    } as any);

    renderWithProviders(<ProductListTable />);

    expect(
      screen.getByRole('columnheader', { name: /Nome/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Categoria/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: /Estoque/i })
    ).toBeInTheDocument();
  });

  it('should expand row and show variants when expand button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useProductsQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      error: null
    } as any);

    renderWithProviders(<ProductListTable />);

    const row = screen.getByRole('row', { name: /Tênis Esportivo/i });

    const expandButton = within(row).getByRole('button', { name: '+' });

    await user.click(expandButton);

    expect(screen.getByText('SNEAKER-X-40')).toBeInTheDocument();
    expect(screen.getByText('SNEAKER-X-41')).toBeInTheDocument();
  });
});
