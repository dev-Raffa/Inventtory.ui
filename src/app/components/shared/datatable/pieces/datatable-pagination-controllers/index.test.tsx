import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationControllers } from '.';

const {
  mockUseDataTable,
  mockSetPageSize,
  mockFirstPage,
  mockPreviousPage,
  mockNextPage,
  mockLastPage,
  mockGetCanPrev,
  mockGetCanNext
} = vi.hoisted(() => {
  const mockFirstPage = vi.fn();
  const mockPreviousPage = vi.fn();
  const mockNextPage = vi.fn();
  const mockLastPage = vi.fn();
  const mockSetPageSize = vi.fn();
  const mockGetCanPrev = vi.fn(() => true);
  const mockGetCanNext = vi.fn(() => true);

  const mockTableInstance = {
    getState: vi.fn(() => ({
      pagination: { pageIndex: 2 }
    })),
    getPageCount: vi.fn(() => 10),
    setPageSize: mockSetPageSize,
    getCanPreviousPage: mockGetCanPrev,
    getCanNextPage: mockGetCanNext,
    firstPage: mockFirstPage,
    previousPage: mockPreviousPage,
    nextPage: mockNextPage,
    lastPage: mockLastPage
  };
  const mockUseDataTable = vi.fn(() => ({ table: mockTableInstance }));

  return {
    mockUseDataTable,
    mockSetPageSize,
    mockFirstPage,
    mockPreviousPage,
    mockNextPage,
    mockLastPage,
    mockGetCanNext,
    mockGetCanPrev
  };
});

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

vi.mock('@/app/components/ui/select', () => ({
  Select: (props: any) => (
    <div data-testid="select-mock">
      <button
        onClick={() => props.onValueChange('50')}
        data-testid="select-trigger"
      >
        50
      </button>
      {props.children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span></span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  )
}));

describe('PaginationControllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getNavButtons = () => {
    const buttons = screen.getAllByRole('button');
    return {
      first: buttons[1],
      prev: buttons[2],
      next: buttons[3],
      last: buttons[4]
    };
  };

  it('should display the page status correctly (Page X of Y)', () => {
    render(<PaginationControllers />);

    expect(screen.getByText('Página 3 de 10')).toBeInTheDocument();
    expect(screen.getByText('Resultados por página:')).toBeInTheDocument();
  });

  it('must call `table.setPageSize` with the correct numeric value when changing the Select statement', async () => {
    render(<PaginationControllers />);

    const user = userEvent.setup();
    const selectTrigger = screen.getByTestId('select-trigger');

    await user.click(selectTrigger);

    expect(mockSetPageSize).toHaveBeenCalledWith(50);
    expect(mockSetPageSize).toHaveBeenCalledTimes(1);
  });

  it('must connect the navigation buttons to the correct TanStack Table functions', async () => {
    render(<PaginationControllers />);

    const user = userEvent.setup();
    const { first, prev, next, last } = getNavButtons();

    await user.click(first);
    expect(mockFirstPage).toHaveBeenCalledTimes(1);

    await user.click(prev);
    expect(mockPreviousPage).toHaveBeenCalledTimes(1);

    await user.click(next);
    expect(mockNextPage).toHaveBeenCalledTimes(1);

    await user.click(last);
    expect(mockLastPage).toHaveBeenCalledTimes(1);
  });

  it('should disable the buttons if getCanPreviousPage and getCanNextPage return false', () => {
    mockGetCanPrev.mockReturnValue(false);
    mockGetCanNext.mockReturnValue(false);

    render(<PaginationControllers />);
    const { first, prev, next, last } = getNavButtons();

    expect(first).toBeDisabled();
    expect(prev).toBeDisabled();
    expect(next).toBeDisabled();
    expect(last).toBeDisabled();
  });
});
