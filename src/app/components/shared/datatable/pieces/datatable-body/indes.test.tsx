import { screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { DataTableBody } from '.';

const { mockFlexRender, mockUseDataTable } = vi.hoisted(() => ({
  mockUseDataTable: vi.fn(),
  mockFlexRender: vi.fn((content) => content)
}));

vi.mock('../../hook/usetable', () => ({
  useDataTable: mockUseDataTable
}));

vi.mock('@tanstack/react-table', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@tanstack/react-table')>();
  return {
    ...mod,
    flexRender: mockFlexRender
  };
});

const MOCK_ROW_ID = 'row-main';
const MOCK_SUB_ROW_CONTENT = 'Conteúdo da Sub-Linha';

const mockCell = {
  id: 'cell_sku',
  column: { columnDef: { cell: 'SKU_Value' } },
  getContext: vi.fn()
};

const mockRow = {
  id: MOCK_ROW_ID,
  original: { id: 'p1' },
  getVisibleCells: vi.fn(() => [mockCell, mockCell, mockCell]),
  getIsExpanded: vi.fn(() => false)
};

const mockRenderSubRow = vi.fn(() => MOCK_SUB_ROW_CONTENT);

const setupAndRender = (isExpanded = false, hasSubRowRenderer = true) => {
  mockRow.getIsExpanded.mockReturnValue(isExpanded);

  mockUseDataTable.mockReturnValue({
    table: {
      getRowModel: vi.fn(() => ({
        rows: [mockRow]
      }))
    },
    renderSubRow: hasSubRowRenderer ? mockRenderSubRow : undefined
  });

  return render(<DataTableBody />);
};

describe('DataTableBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('should render the main row and use flexRender for each cell', () => {
    setupAndRender(false, true);

    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(mockFlexRender).toHaveBeenCalledTimes(3);
    expect(screen.queryByText(MOCK_SUB_ROW_CONTENT)).not.toBeInTheDocument();
  });

  it('should render both the main line and the subline when expanded', () => {
    setupAndRender(true, true);

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText(MOCK_SUB_ROW_CONTENT)).toBeInTheDocument();
    expect(mockRenderSubRow).toHaveBeenCalledWith(mockRow, 0);

    const subRowCell = screen.getByText(MOCK_SUB_ROW_CONTENT).closest('td');

    expect(subRowCell).toHaveAttribute('colspan', '3');
  });

  it('the sub-line should NOT be rendered, even if expanded, if renderSubRow is null', () => {
    setupAndRender(true, false);

    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(mockRenderSubRow).not.toHaveBeenCalled();
    expect(screen.queryByText(MOCK_SUB_ROW_CONTENT)).not.toBeInTheDocument();
  });
});
