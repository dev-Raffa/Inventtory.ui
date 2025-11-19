import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type ColumnDef } from '@tanstack/react-table';
import { NestedDataTable } from '.';

const { mockUseReactTable, mockUseDataTable } = vi.hoisted(() => {
  const mockNestedCells = [
    {
      id: 'c1',
      column: { id: 'sku', columnDef: { cell: 'SKU Value' } },
      getContext: vi.fn()
    },
    {
      id: 'c2',
      column: { id: 'price', columnDef: { cell: 'Price Value' } },
      getContext: vi.fn()
    },
    {
      id: 'c3',
      column: { id: 'actions', columnDef: { cell: 'Actions' } },
      getContext: vi.fn()
    }
  ];

  const mockRowModel = {
    rows: [
      {
        id: 'n_row_1',
        original: { data: 'test' },
        getVisibleCells: vi.fn(() => mockNestedCells)
      }
    ]
  };

  const mockUseReactTable = vi.fn(() => ({
    getRowModel: vi.fn(() => mockRowModel)
  }));

  const mockUseDataTable = vi.fn();
  const mockParentVisibleColumns = [{ id: 'sku' }, { id: 'actions' }];
  mockUseDataTable.mockReturnValue({
    table: {
      getVisibleFlatColumns: vi.fn(() => mockParentVisibleColumns)
    }
  });

  return {
    mockUseReactTable,
    mockUseDataTable
  };
});

vi.mock('@tanstack/react-table', async (importOriginal) => ({
  ...(await importOriginal()),
  useReactTable: mockUseReactTable,
  flexRender: vi.fn((content) => content) // Simplificamos o flexRender para retornar o conteúdo
}));

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

const mockParentData = { id: 'p1', name: 'Product A' };
const mockColumnsDef: ColumnDef<any>[] = [{ accessorKey: 'sku' }];
const mockNestedData = [
  {
    variant: 'Red',
    price: 10
  },
  {
    variant: 'Blue',
    price: 12
  }
];

describe('NestedDataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('must initialize useReactTable with the correct data, columns, and meta object', () => {
    render(
      <NestedDataTable
        data={mockNestedData}
        columns={mockColumnsDef}
        parentData={mockParentData}
      />
    );

    expect(mockUseReactTable).toHaveBeenCalledTimes(1);

    //@ts-expect-error second [0]
    const callArgs: any = mockUseReactTable.mock.calls[0][0];

    expect(callArgs.data).toEqual(mockNestedData);
    expect(callArgs.columns).toBe(mockColumnsDef);

    expect(callArgs.meta).toEqual({
      parentData: mockParentData
    });
  });

  it('should only render the cells visible in the parent table', () => {
    render(
      <NestedDataTable
        data={mockNestedData}
        columns={mockColumnsDef}
        parentData={mockParentData}
      />
    );

    expect(screen.getByRole('rowgroup')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(2);
    expect(screen.getByText('SKU Value')).toBeInTheDocument();
    expect(screen.queryByText('Price Value')).not.toBeInTheDocument();
  });
});
