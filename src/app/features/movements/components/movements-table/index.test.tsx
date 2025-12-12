import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovementsListTable } from './index';
import type { MovementResponse } from '../../types/model';
import { BrowserRouter } from 'react-router';

vi.mock('@/app/components/shared/datatable', () => ({
  DataTable: ({ tableOptions, renderSubRow, children }: any) => (
    <div data-testid="mock-datatable">
      <span data-testid="datatable-row-count">
        {tableOptions.data?.length ?? 0}
      </span>

      {tableOptions.data?.[0] && renderSubRow && (
        <div data-testid="mock-sub-row-container">
          {renderSubRow({ original: tableOptions.data[0] }, 0)}
        </div>
      )}

      {children}
    </div>
  ),
  DataTableTextFilter: ({ placeholder }: any) => (
    <div data-testid="mock-text-filter">{placeholder}</div>
  ),
  DataTableSelectFilter: ({ options, placeholder }: any) => (
    <div data-testid="mock-select-filter">
      {placeholder}: {options.length} options
    </div>
  ),
  DataTableDateRangeFilter: () => <div data-testid="mock-date-filter" />,
  DataTableContent: () => <div data-testid="mock-table-content" />,
  PaginationControllers: () => <div data-testid="mock-pagination" />
}));

vi.mock('./columns', () => ({
  columnsMovementsListTable: []
}));

vi.mock('../movements-items-table', () => ({
  MovementsItemsTable: ({ data }: any) => (
    <div data-testid="mock-items-table">Items Count: {data.length}</div>
  )
}));

const mockMovements: MovementResponse[] = [
  {
    id: '1',
    date: '2023-10-01T10:00:00Z',
    type: 'entry',
    reason: 'Compra Inicial',
    totalQuantity: 100,
    user: { name: 'Admin', initials: 'AD' },
    items: [
      {
        id: 'item-1',
        productId: 'p1',
        productName: 'Produto 1',
        currentStock: 10,
        quantity: 5,
        productImage: ''
      }
    ]
  },
  {
    id: '2',
    date: '2023-10-02T14:30:00Z',
    type: 'withdrawal',
    reason: 'Venda',
    totalQuantity: 5,
    user: { name: 'Vendedor', initials: 'VE' },
    items: []
  }
];

describe('MovementsListTable', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  it('should pass data correctly to DataTable', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('2');
  });

  it('should render empty state correctly when data is empty', () => {
    render(<MovementsListTable data={[]} />, { wrapper });

    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('0');
  });

  it('should handle undefined data gracefully', () => {
    render(<MovementsListTable data={undefined as any} />, { wrapper });

    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('0');
  });

  it('should render sub-row content (MovementsItemsTable)', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    const subRowContainer = screen.getByTestId('mock-sub-row-container');

    expect(subRowContainer).toBeInTheDocument();
    expect(screen.getByTestId('mock-items-table')).toHaveTextContent(
      'Items Count: 1'
    );
  });

  it('should render all filters and controllers', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    expect(screen.getByTestId('mock-text-filter')).toHaveTextContent(
      'Buscar por produto, SKU ou usuário...'
    );
    expect(screen.getByTestId('mock-select-filter')).toHaveTextContent(
      'Tipo: 4 options'
    );
    expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });
});
