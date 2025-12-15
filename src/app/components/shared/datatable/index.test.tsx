import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type TableState
} from '@tanstack/react-table';

import { DataTable } from './pieces/datatable';
import { DataTableBody } from './pieces/datatable-body';
import { PaginationControllers } from './pieces/datatable-pagination-controllers';
import { DataTableHeader } from './pieces/datatable-header';
import { DataTableTextFilter } from './pieces/datatable-text-filter';
import { DataTableHeaderSortableColumn } from './pieces/datatable-header-sortable-column';
import { DataTableDropdownColumnsVisibility } from './pieces/datatable-dropdown-column-visibility';

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

type TestData = {
  id: string;
  name: string;
  price: number;
};

const mockData: TestData[] = Array.from({ length: 25 }, (_, i) => ({
  id: `id-${i}`,
  name: `Produto ${i < 10 ? '0' + i : i}`,
  price: (i + 1) * 10
}));

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableHeaderSortableColumn column={column} title="Nome do Produto" />
    ),
    meta: { nameInFilters: 'Nome do Produto' }
  },
  {
    accessorKey: 'price',
    header: 'Preço',
    cell: ({ getValue }) => `R$ ${getValue()}`
  }
];

const IntegrationTable = ({
  data = mockData,
  customEmptyMessage,
  showSubRow = false,
  initialState = {}
}: {
  data?: TestData[];
  customEmptyMessage?: string;
  showSubRow?: boolean;
  initialState?: Partial<TableState>;
}) => (
  <DataTable
    emptyMessage={customEmptyMessage}
    renderSubRow={
      showSubRow
        ? (row) => (
            <div data-testid="sub-row-content">
              Detalhes: {row.original.name}
            </div>
          )
        : undefined
    }
    tableOptions={{
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: () => true,
      initialState: {
        pagination: { pageSize: 10 },
        ...initialState
      }
    }}
  >
    <DataTableTextFilter placeholder="Buscar Geral..." />
    <DataTableTextFilter placeholder="Filtrar Nome..." column="name" />
    <DataTableDropdownColumnsVisibility />
    <table>
      <DataTableHeader />
      <DataTableBody />
    </table>
    <PaginationControllers />
  </DataTable>
);

describe('DataTable Integration & Coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render custom empty message', () => {
    render(
      <IntegrationTable data={[]} customEmptyMessage="Nada encontrado!" />
    );
    expect(screen.getByText('Nada encontrado!')).toBeInTheDocument();
  });

  it('should navigate using ALL pagination buttons (First, Prev, Next, Last)', async () => {
    const user = userEvent.setup();
    render(<IntegrationTable />);

    const firstBtn = screen.getByRole('button', { name: 'Primeira página' });
    const prevBtn = screen.getByRole('button', { name: 'Página anterior' });
    const nextBtn = screen.getByRole('button', { name: 'Próxima página' });
    const lastBtn = screen.getByRole('button', { name: 'Última página' });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();
    expect(screen.getByText('Produto 00')).toBeInTheDocument();

    await user.click(nextBtn);
    expect(screen.getByText('Produto 10')).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    await user.click(lastBtn);
    expect(screen.getByText('Produto 24')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    await user.click(prevBtn);
    expect(screen.getByText('Produto 10')).toBeInTheDocument();

    await user.click(firstBtn);
    expect(screen.getByText('Produto 00')).toBeInTheDocument();
  });

  it('should filter by specific column AND global filter', async () => {
    vi.useFakeTimers();
    render(<IntegrationTable />);

    const globalInput = screen.getByPlaceholderText('Buscar Geral...');
    fireEvent.change(globalInput, { target: { value: 'Produto 2' } });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('Produto 20')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Filtrar Nome...');
    fireEvent.change(nameInput, { target: { value: '23' } });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Produto 23')).toBeInTheDocument();
    expect(screen.queryByText('Produto 20')).not.toBeInTheDocument();
  });

  it('should sort Ascending and Descending', async () => {
    const user = userEvent.setup();
    render(<IntegrationTable />);

    const headerBtn = screen.getByRole('button', { name: 'Nome do Produto' });

    await user.click(headerBtn);
    await user.click(screen.getByRole('menuitem', { name: 'Desc' }));
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Produto 24');

    await user.click(headerBtn);
    await user.click(screen.getByRole('menuitem', { name: 'Asc' }));

    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Produto 00');
  });

  it('should render sub-row content when expanded', () => {
    render(
      <IntegrationTable showSubRow={true} initialState={{ expanded: true }} />
    );

    const subRows = screen.getAllByTestId('sub-row-content');

    expect(subRows.length).toBeGreaterThan(0);
    expect(subRows[0]).toHaveTextContent('Detalhes: Produto 00');
  });

  it('should change page size via select', async () => {
    const user = userEvent.setup();
    render(<IntegrationTable />);

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const option20 = await screen.findByRole('option', { name: '20' });
    await user.click(option20);

    expect(screen.getByText('Produto 19')).toBeInTheDocument();
    expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
  });

  it('should toggle column visibility', async () => {
    const user = userEvent.setup();
    render(<IntegrationTable />);

    expect(screen.getByText('Preço')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Exibir Colunas/i });
    await user.click(toggleBtn);

    const priceOption = screen.getByRole('menuitemcheckbox', { name: 'Preço' });
    await user.click(priceOption);

    expect(screen.queryByText('Preço')).not.toBeInTheDocument();
  });
});
