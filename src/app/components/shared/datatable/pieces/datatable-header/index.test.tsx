import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataTableHeader } from '.';
import type { ReactNode } from 'react';

const {
  mockFlexRender,
  MockTableHead,
  mockUseDataTable,
  mockHeaderData,
  mockResizeHandler
} = vi.hoisted(() => {
  const mockFlexRender = vi.fn((content) => content);
  const MockTableHead = vi.fn((props) => (
    <th data-testid={`th-${props.id}`} {...props}>
      {props.children}
    </th>
  ));

  const mockResizeHandler = vi.fn();
  const mockHeaderData = [
    {
      id: 'a',
      isPlaceholder: false,
      getContext: vi.fn(),
      getResizeHandler: vi.fn(() => mockResizeHandler),
      column: {
        id: 'a-col',
        columnDef: { header: 'Nome' },
        getCanResize: vi.fn(() => true),
        getIsResizing: vi.fn(() => false)
      }
    },
    {
      id: 'b',
      isPlaceholder: true,
      colSpan: 1,
      getContext: vi.fn(),
      getResizeHandler: vi.fn(),
      column: {
        id: 'b-col',
        columnDef: { header: 'PH' },
        getCanResize: vi.fn(() => true),
        getIsResizing: vi.fn(() => false)
      }
    },
    {
      id: 'c',
      isPlaceholder: false,
      colSpan: 1,
      getContext: vi.fn(),
      getResizeHandler: vi.fn(),
      column: {
        id: 'c-col',
        columnDef: { header: 'SKU' },
        getCanResize: vi.fn(() => false),
        getIsResizing: vi.fn(() => false)
      }
    },
    {
      id: 'd',
      isPlaceholder: false,
      colSpan: 1,
      getContext: vi.fn(),
      getResizeHandler: vi.fn(() => mockResizeHandler),
      column: {
        id: 'd-col',
        columnDef: { header: 'Stock' },
        getCanResize: vi.fn(() => true),
        getIsResizing: vi.fn(() => true)
      }
    }
  ];

  const mockUseDataTable = vi.fn(() => ({
    table: {
      getHeaderGroups: vi.fn(() => [
        { id: 'group1', headers: [mockHeaderData[0], mockHeaderData[1]] },
        { id: 'group2', headers: [mockHeaderData[2], mockHeaderData[3]] }
      ]),
      getState: vi.fn(() => ({}))
    }
  }));

  return {
    mockFlexRender,
    MockTableHead,
    mockUseDataTable,
    mockHeaderData,
    mockResizeHandler
  };
});

vi.mock('@tanstack/react-table', async (importOriginal) => ({
  ...(await importOriginal()),
  flexRender: mockFlexRender
}));

vi.mock('@/app/components/ui/table', () => ({
  TableHead: MockTableHead,
  TableHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="table-header">{children}</div>
  ),
  TableRow: ({ children }: { children: ReactNode }) => (
    <tr data-testid="table-row">{children}</tr>
  )
}));

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

describe('DataTableHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('should render the correct number of cells and ignore placeholders', () => {
    render(<DataTableHeader />);

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(mockFlexRender).toHaveBeenCalledTimes(3);
    expect(mockHeaderData[1].isPlaceholder).toBe(true);
  });

  it('must link getResizeHandler to onMouseDown/onTouchStart for resizable columns', () => {
    render(<DataTableHeader />);

    const headerA = screen.getByTestId('th-a');
    const resizeHandleA = headerA.querySelector('div:last-child');
    expect(resizeHandleA).toBeInTheDocument();

    fireEvent.mouseDown(resizeHandleA!);
    fireEvent.touchStart(resizeHandleA!);

    expect(mockHeaderData[0].getResizeHandler).toHaveBeenCalledTimes(2);

    expect(mockResizeHandler).toHaveBeenCalledTimes(2);

    const headerC = screen.getByTestId('th-c');

    expect(headerC.querySelector('div:last-child')).toBeNull();
  });

  it('the "active" class should be applied when the column is being resized', () => {
    render(<DataTableHeader />);

    const headerD = screen.getByTestId('th-d');
    const resizeHandleD = headerD.querySelector('div:last-child');

    expect(resizeHandleD).toHaveClass('opacity-20');
    expect(resizeHandleD).toHaveClass('bg-primary');

    expect(resizeHandleD).not.toHaveClass('opacity-0');
  });
});
