import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DataTableContent } from '.';

const {
  MockTable,
  MockDataTableBody,
  MockDataTableHeader,
  MockMemoizedDataTableBody,
  mockUseDataTable
} = vi.hoisted(() => ({
  MockTable: vi.fn((props) => (
    <table data-testid="table-root" style={props.style}>
      {props.children}
    </table>
  )),
  MockDataTableHeader: vi.fn(() => <div data-testid="mock-header" />),
  MockDataTableBody: vi.fn(() => <div data-testid="mock-body" />),
  MockMemoizedDataTableBody: vi.fn(() => <div data-testid="mock-memo-body" />),
  mockUseDataTable: vi.fn()
}));

vi.mock('@/app/components/ui/table', () => ({ Table: MockTable }));

vi.mock('../datatable-header', () => ({
  DataTableHeader: MockDataTableHeader
}));

vi.mock('../datatable-body', () => ({
  DataTableBody: MockDataTableBody,
  MemoizedDataTableBody: MockMemoizedDataTableBody
}));

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

const mockFlatHeaders = [
  {
    id: 'name',
    getSize: vi.fn(() => 200),
    column: { id: 'nameCol', getSize: vi.fn(() => 100) }
  },
  {
    id: 'sku',
    getSize: vi.fn(() => 100),
    column: { id: 'skuCol', getSize: vi.fn(() => 50) }
  }
];

const setupMocks = (
  isResizing: boolean,
  headers = mockFlatHeaders,
  columnSizing = {}
) => {
  mockUseDataTable.mockReturnValue({
    table: {
      getState: vi.fn(() => ({
        columnSizingInfo: {
          isResizingColumn: isResizing,
          startOffset: null,
          startSize: null
        },
        columnSizing: columnSizing
      })),
      getFlatHeaders: vi.fn(() => headers)
    }
  });
};

describe('DataTableContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('must calculate and apply the CSS column size variables in the Table tag.', () => {
    setupMocks(false);

    render(<DataTableContent />);

    const tableProps = MockTable.mock.calls[0][0];

    expect(tableProps.style).toBeDefined();

    const expectedVariables = {
      '--th-name-size': 200,
      '--col-nameCol-size': 100,
      '--th-sku-size': 100,
      '--col-skuCol-size': 50
    };

    expect(tableProps.style).toEqual(expectedVariables);
    expect(MockDataTableHeader).toHaveBeenCalledTimes(1);
  });

  it('should render the normal DataTableBody when it is NOT resizing', () => {
    setupMocks(false);

    render(<DataTableContent />);

    expect(MockDataTableBody).toHaveBeenCalledTimes(1);
    expect(MockMemoizedDataTableBody).not.toHaveBeenCalled();
  });

  it('should render the memoized body (MemoizedDataTableBody) when resizing', () => {
    setupMocks(true);

    render(<DataTableContent />);

    expect(MockMemoizedDataTableBody).toHaveBeenCalledTimes(1);
    expect(MockDataTableBody).not.toHaveBeenCalled();
  });
});
