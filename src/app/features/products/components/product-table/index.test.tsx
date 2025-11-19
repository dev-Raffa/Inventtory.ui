import { screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProductListTable } from './';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import type { IProduct } from '../../types';
import type { Row } from '@tanstack/react-table';
import type { IDataTable } from '@/app/components/shared/datatable/pieces/datatable';

const mockProducts = [
  {
    id: '1',
    name: 'Prod A',
    sku: 'A1',
    hasVariants: false,
    stock: 10,
    minimumStock: 5
  },
  {
    id: '2',
    name: 'Prod B',
    sku: 'B1',
    hasVariants: true,
    variants: [{ sku: 'B1-RED' }],
    stock: 0,
    minimumStock: 0
  }
];

const { MockDataTable, MockNestedDataTable, mockUseProductsQuery } = vi.hoisted(
  () => ({
    MockDataTable: vi.fn(({ children, ...props }: IDataTable<IProduct>) => (
      <div data-testid="data-table" {...props}>
        {children}
      </div>
    )),
    MockNestedDataTable: vi.fn(({ children }: { children: ReactNode }) => (
      <div data-testid="nested-table">{children}</div>
    )),
    mockUseProductsQuery: vi.fn()
  })
);

vi.mock('../../hooks/use-query', () => ({
  useProductsQuery: () => mockUseProductsQuery()
}));

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>();
  return {
    ...mod,
    Link: ({ to, children }: any) => (
      <a href={to} data-testid="link-add">
        {children}
      </a>
    )
  };
});

vi.mock('@/app/components/shared/datatable/exports', () => ({
  DataTable: MockDataTable,
  DataTableContent: () => <div data-testid="datatable-content"></div>,
  DataTableDropdownColumnsVisibility: () => (
    <div data-testid="datatable-visibility"></div>
  ),
  DataTableTextFilter: () => <div data-testid="datatable-filter"></div>,
  PaginationControllers: () => <div data-testid="datatable-pagination"></div>,
  NestedDataTable: MockNestedDataTable
}));

vi.mock('./columns', () => ({
  columnsProductListTable: [{ accessorKey: 'name', header: 'Nome' }]
}));

vi.mock('../product-variants-table/columns', () => ({
  productVariantsTableColumns: [{ accessorKey: 'sku', header: 'SKU' }]
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductListTable />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProductListTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all UI components and the add button', () => {
    mockUseProductsQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false
    });

    renderComponent();

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-filter')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-pagination')).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: 'Adicionar' });

    expect(addButton).toBeInTheDocument();
    expect(screen.getByTestId('link-add')).toHaveAttribute('href', 'create');
    expect(
      screen.getByRole('button', { name: 'Adicionar' })
    ).toBeInTheDocument();
  });

  it('deve passar um array vazio para a DataTable quando a query retornar undefined', () => {
    mockUseProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false
    });

    renderComponent();

    const tableProps = MockDataTable.mock.lastCall?.[0];

    expect(tableProps?.tableOptions.data).toEqual([]);

    expect(
      screen.getByRole('button', { name: 'Adicionar' })
    ).toBeInTheDocument();
  });

  it('must pass the correct options (data and columns) to the DataTable', () => {
    mockUseProductsQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false
    });

    renderComponent();

    const props = MockDataTable.mock.calls[0][0];

    const expectedTableOptions = expect.objectContaining({
      data: mockProducts,
      columns: expect.arrayContaining([
        expect.objectContaining({ header: 'Nome' })
      ]),
      columnResizeMode: 'onChange',
      getCoreRowModel: expect.any(Function),
      getExpandedRowModel: expect.any(Function),
      getFilteredRowModel: expect.any(Function),
      getPaginationRowModel: expect.any(Function),
      getSortedRowModel: expect.any(Function),
      state: expect.objectContaining({ expanded: expect.any(Object) }),
      onExpandedChange: expect.any(Function)
    });

    expect(props).toEqual(
      expect.objectContaining({
        renderSubRow: expect.any(Function),
        tableOptions: expectedTableOptions,
        children: expect.any(Array)
      })
    );
  });

  it('must call the NestedDataTable with the correct props', () => {
    renderComponent();

    const mockRow: Row<IProduct> = {
      original: mockProducts[1]
    } as unknown as Row<IProduct>;

    const renderSubRow = MockDataTable.mock.calls[0][0].renderSubRow;

    if (renderSubRow) {
      const nestedTableElement = renderSubRow(mockRow, 0);
      render(nestedTableElement);
    }

    expect(MockNestedDataTable).toHaveBeenCalledTimes(1);
    expect(MockNestedDataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockProducts[1].variants,
        columns: expect.arrayContaining([
          expect.objectContaining({ header: 'SKU' })
        ]),
        parentData: mockRow.original
      }),
      undefined
    );
  });

  it('must manage the expanded state', () => {
    renderComponent();

    const setIsExpanded =
      MockDataTable.mock.calls[0][0].tableOptions.onExpandedChange;

    const newExpandedState = { '0': true };

    if (setIsExpanded) {
      act(() => {
        setIsExpanded(newExpandedState);
      });
    }

    const updatedOptions = MockDataTable.mock.lastCall?.[0].tableOptions;

    if (updatedOptions) {
      expect(updatedOptions.state?.expanded).toEqual(newExpandedState);
    }
  });
});
