import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovementsItemsTable } from './index';
import type { MovementResponse, MovementItemResponse } from '../../types/model';

vi.mock('@/app/components/shared/simple-data-table', () => ({
  SimpleDataTable: ({ data, columns, meta }: any) => (
    <table data-testid="mock-simple-table">
      <tbody>
        {data.map((row: any, rowIndex: number) => (
          <tr key={rowIndex} data-testid="table-row">
            {columns.map((col: any, colIndex: number) => (
              <td key={colIndex}>
                {typeof col.cell === 'function'
                  ? col.cell({
                      row: { original: row },
                      table: { options: { meta } }
                    })
                  : row[col.accessorKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

vi.mock('@/app/components/shared/image-card', () => ({
  ImageCard: ({ src, alt }: any) => (
    <img data-testid="mock-image" src={src} alt={alt} />
  )
}));

vi.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="mock-badge" className={className}>
      {children}
    </span>
  )
}));

const mockParentEntry: MovementResponse = {
  id: '1',
  date: '2023-01-01',
  type: 'entry',
  reason: 'Test',
  totalQuantity: 10,
  user: { name: 'User', initials: 'US' },
  items: []
};

const mockParentWithdrawal: MovementResponse = {
  ...mockParentEntry,
  type: 'withdrawal'
};

const mockParentAdjustment: MovementResponse = {
  ...mockParentEntry,
  type: 'adjustment'
};

const mockItems: MovementItemResponse[] = [
  {
    id: 'item-1',
    productId: 'p1',
    productName: 'Camisa Polo',
    productImage: 'camisa.jpg',
    variantAttributes: 'Azul / G',
    currentStock: 50,
    quantity: 5
  },
  {
    id: 'item-2',
    productId: 'p2',
    productName: 'Boné',
    productImage: '',
    variantAttributes: '',
    currentStock: 20,
    quantity: 2
  }
];

describe('MovementsItemsTable', () => {
  it('should render the table and items correctly', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    expect(screen.getByTestId('mock-simple-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('table-row')).toHaveLength(2);
    expect(screen.getByText('Camisa Polo')).toBeInTheDocument();
    expect(screen.getByText('Boné')).toBeInTheDocument();
  });

  it('should display image placeholder when image is missing', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    const images = screen.getAllByTestId('mock-image');

    expect(images[0]).toHaveAttribute('src', 'camisa.jpg');
    expect(images[1]).toHaveAttribute('src', '/placeholder.svg');
  });

  it('should display variant attributes or "item único" fallback', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    expect(screen.getByText('Azul / G')).toBeInTheDocument();
    expect(screen.getByText('item único')).toBeInTheDocument();
  });

  it('should render entry quantities with plus sign and green color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    const quantityCell = screen.getByText('+5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-green-600');
  });

  it('should render withdrawal quantities with minus sign and red color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentWithdrawal} />
    );

    const quantityCell = screen.getByText('-5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-red-600');
  });

  it('should render adjustment quantities with no sign and orange color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentAdjustment} />
    );

    const quantityCell = screen.getByText('5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-orange-600');
    expect(quantityCell).not.toHaveTextContent('+');
    expect(quantityCell).not.toHaveTextContent('-');
  });

  it('should display current stock correctly', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
