import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Column } from '@tanstack/react-table';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HeaderSortableColumn } from '.';

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    actual,
    ArrowUp: (props: any) => <svg {...props} data-testid="arrow-up" />,
    ArrowDown: (props: any) => <svg {...props} data-testid="arrow-down" />,
    ChevronsUpDown: (props: any) => <svg {...props} data-testid="chevrons" />
  };
});

const mockToggleSorting = vi.fn();

const mockColumn: Partial<Column<any, unknown>> = {
  id: 'name',
  getCanSort: vi.fn(() => true),
  //@ts-expect-error type is not compatible
  getIsSorted: vi.fn(() => false),
  toggleSorting: mockToggleSorting
};

const mockColumnNotSortable: Partial<Column<any, unknown>> = {
  id: 'sku',
  getCanSort: vi.fn(() => false),
  //@ts-expect-error type is not compatible
  getIsSorted: vi.fn(() => false)
};

const renderComponent = (columnOverride = {}) => {
  const column = { ...mockColumn, ...columnOverride } as Column<any, unknown>;
  return render(<HeaderSortableColumn column={column} title="Nome" />);
};

describe('HeaderSortableColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the title and the neutral icon (ChevronsUpDown) when not ordered.', () => {
    renderComponent();

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByTestId('chevrons')).toBeInTheDocument();
    expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
    expect(screen.queryByTestId('arrow-down')).not.toBeInTheDocument();
  });

  it('should render the up arrow icon (ArrowUp) when sorted ASC', () => {
    renderComponent({ getIsSorted: vi.fn(() => 'asc') });

    expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    expect(screen.queryByTestId('chevrons')).not.toBeInTheDocument();
  });

  it('should render the down arrow icon (ArrowDown) when ordered DESC', () => {
    renderComponent({ getIsSorted: vi.fn(() => 'desc') });

    expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
    expect(screen.queryByTestId('chevrons')).not.toBeInTheDocument();
  });
});

describe('HeaderSortableColumn - Interactions', () => {
  const user = userEvent.setup();

  it('must call toggleSorting(false) for ascending sorting', async () => {
    renderComponent({ getCanSort: vi.fn(() => true) });

    const triggerButton = screen.getByRole('button', { name: 'Nome' });

    await user.click(triggerButton);

    const ascOption = await screen.findByRole('menuitem', { name: /asc/i });

    await user.click(ascOption);

    expect(mockToggleSorting).toHaveBeenCalledWith(false);
    expect(mockToggleSorting).toHaveBeenCalledTimes(1);
  });

  it('must call toggleSorting(true) for descending sorting', async () => {
    renderComponent({ getCanSort: vi.fn(() => true) });

    const triggerButton = screen.getByRole('button', { name: 'Nome' });

    await user.click(triggerButton);

    const descOption = await screen.findByRole('menuitem', { name: /desc/i });

    await user.click(descOption);

    expect(mockToggleSorting).toHaveBeenCalledWith(true);
    expect(mockToggleSorting).toHaveBeenCalledTimes(2);
  });

  it('Do NOT render sorting options if the column cannot be sorted', async () => {
    renderComponent(mockColumnNotSortable);

    const triggerButton = screen.getByRole('button', { name: 'Nome' });

    await user.click(triggerButton);

    expect(
      screen.queryByRole('menuitem', { name: /asc/i })
    ).not.toBeInTheDocument();

    expect(screen.queryByText('Asc')).not.toBeInTheDocument();
  });
});
