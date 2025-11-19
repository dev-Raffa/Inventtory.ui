import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleDataTable } from './';
import type { ColumnDef } from '@tanstack/react-table';

const { mockFlexRender, mockUseReactTable } = vi.hoisted(() => {
  const mockFlexRender = vi.fn((content) => `RENDERED: ${content}`);
  const mockUseReactTable = vi.fn();

  return {
    mockFlexRender,
    mockUseReactTable
  };
});

vi.mock('@tanstack/react-table', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@tanstack/react-table')>();
  return {
    ...mod,
    useReactTable: mockUseReactTable,
    flexRender: mockFlexRender
  };
});

const mockHeaderContent = 'Nome da Coluna';
const mockCellContent = 'Dado da Célula';

const mockCell = {
  id: 'c1',
  column: { columnDef: { cell: mockCellContent } },
  getContext: vi.fn()
};
const mockRow = {
  id: 'r1',
  getVisibleCells: vi.fn(() => [mockCell])
};

const mockHeader = {
  id: 'h1',
  isPlaceholder: false,
  colSpan: 1,
  getContext: vi.fn(),
  column: { columnDef: { header: mockHeaderContent } }
};

const mockPlaceholderHeader = {
  ...mockHeader,
  id: 'h2',
  isPlaceholder: true
};

const mockTableInstance = {
  getHeaderGroups: vi.fn(() => [
    { id: 'hg1', headers: [mockHeader, mockPlaceholderHeader] }
  ]),
  getRowModel: vi.fn(() => ({ rows: [mockRow] }))
};

describe('SimpleDataTable', () => {
  const mockData = [{ id: 1, name: 'Produto' }];
  const mockColumns: ColumnDef<any>[] = [{ accessorKey: 'id' }];
  const mockMeta = { parentData: { context: 'test' } };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReactTable.mockReturnValue(mockTableInstance as any);
  });

  it('must call useReactTable with data, columns, getCoreRowModel, and meta (if provided)', () => {
    render(
      <SimpleDataTable data={mockData} columns={mockColumns} meta={mockMeta} />
    );

    expect(mockUseReactTable).toHaveBeenCalledTimes(1);

    const options = mockUseReactTable.mock.calls[0][0];

    expect(options.data).toBe(mockData);
    expect(options.columns).toBe(mockColumns);
    expect(options.meta).toBe(mockMeta);
    expect(options.getCoreRowModel).toBeInstanceOf(Function);
  });

  it('should render the headers and call flexRender, ignoring placeholders', () => {
    render(<SimpleDataTable data={mockData} columns={mockColumns} />);

    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(mockFlexRender).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(`RENDERED: ${mockHeaderContent}`)
    ).toBeInTheDocument();

    expect(mockPlaceholderHeader.isPlaceholder).toBe(true);
  });

  it('should render the rows and cells and call flexRender for the body', () => {
    render(<SimpleDataTable data={mockData} columns={mockColumns} />);

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(1);
    expect(mockFlexRender).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(`RENDERED: ${mockCellContent}`)
    ).toBeInTheDocument();
  });
});
