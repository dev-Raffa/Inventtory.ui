import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DataTableDropdownColumnsVisibility } from '.';
import userEvent from '@testing-library/user-event';

const { mockUseDataTable, MockDropdownMenuCheckboxItem, mockToggleVisibility } =
  vi.hoisted(() => {
    const mockToggleVisibility = vi.fn();
    const mockColumns = [
      {
        id: 'name',
        getCanHide: vi.fn(() => true),
        getIsVisible: vi.fn(() => true),
        toggleVisibility: mockToggleVisibility,
        columnDef: {
          header: 'Name Header',
          meta: { nameInFilters: 'Nome do Produto' }
        }
      },
      {
        id: 'sku',
        getCanHide: vi.fn(() => true),
        getIsVisible: vi.fn(() => false),
        toggleVisibility: mockToggleVisibility,
        columnDef: { header: 'SKU Header' }
      },
      {
        id: 'actions',
        getCanHide: vi.fn(() => false),
        getIsVisible: vi.fn(() => true),
        toggleVisibility: mockToggleVisibility,
        columnDef: { header: 'Actions Header' }
      }
    ];

    const mockUseDataTable = vi.fn(() => ({
      table: { getAllColumns: vi.fn(() => mockColumns) }
    }));

    const MockDropdownMenuCheckboxItem = vi.fn(
      ({ checked, onCheckedChange, children }) => (
        <label
          data-testid={`checkbox-${children}`}
          data-checked={checked.toString()}
          onClick={() => onCheckedChange(false)}
        >
          {' '}
          {children}
        </label>
      )
    );

    return {
      mockUseDataTable,
      MockDropdownMenuCheckboxItem,
      mockToggleVisibility
    };
  });

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

vi.mock('@/app/components/ui/dropdown-menu', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/app/components/ui/dropdown-menu')>();
  return {
    ...actual,
    DropdownMenuCheckboxItem: MockDropdownMenuCheckboxItem
  };
});

describe('DataTableDropdownColumnsVisibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the trigger button and open the menu', async () => {
    render(<DataTableDropdownColumnsVisibility />);

    const user = userEvent.setup();
    const triggerButton = screen.getByRole('button', { name: /Configurar/i });

    expect(triggerButton).toBeInTheDocument();

    user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Visualizar Colunas')).toBeInTheDocument();
    });
  });

  it('should filter columns and render only the 2 hideables', async () => {
    render(<DataTableDropdownColumnsVisibility />);

    const user = userEvent.setup();
    const triggerButton = screen.getByRole('button', { name: /Configurar/i });

    await user.click(triggerButton);

    const menuItems = screen.getAllByTestId(/checkbox-/i);

    expect(menuItems).toHaveLength(2);

    expect(screen.queryByText('Actions Header')).not.toBeInTheDocument();
  });

  it('must connect the state and the toggleVisibility function correctly', async () => {
    render(<DataTableDropdownColumnsVisibility />);

    const triggerButton = screen.getByRole('button', { name: /Configurar/i });
    const user = userEvent.setup();

    await user.click(triggerButton);

    const nameItem = await screen.findByText('Nome do Produto');

    const skuItem = screen.getByText('SKU Header');

    expect(nameItem).toBeInTheDocument();
    expect(skuItem).toBeInTheDocument();
    expect(nameItem.closest('label')).toHaveAttribute('data-checked', 'true');
    expect(skuItem.closest('label')).toHaveAttribute('data-checked', 'false');

    await fireEvent.click(skuItem); // Clica no SKU

    expect(mockToggleVisibility).toHaveBeenCalledTimes(1);
  });
});
