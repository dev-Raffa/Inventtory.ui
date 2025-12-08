import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DataTableTextFilter } from '.';

const {
  mockUseDataTable,
  MockInput,
  mockSetGlobalFilter,
  mockSetFilterValue,
  mockGetFilterValue
} = vi.hoisted(() => {
  const mockSetGlobalFilter = vi.fn();
  const mockSetFilterValue = vi.fn();
  const mockGetFilterValue = vi.fn(() => 'valor inicial');

  const mockColumn = {
    getFilterValue: mockGetFilterValue,
    setFilterValue: mockSetFilterValue
  };

  const mockTable = {
    setGlobalFilter: mockSetGlobalFilter,
    getColumn: vi.fn((id) => (id === 'name' ? mockColumn : undefined))
  };

  const mockUseDataTable = vi.fn(() => ({ table: mockTable }));

  const MockInput = vi.fn((props) => (
    <input data-testid="text-filter-input" {...props} />
  ));

  return {
    mockUseDataTable,
    MockInput,
    mockSetGlobalFilter,
    mockSetFilterValue,
    mockGetFilterValue
  };
});

vi.mock('../../hook/usetable', () => ({ useDataTable: mockUseDataTable }));

vi.mock('@/app/components/ui/input', () => ({ Input: MockInput }));

describe('DataTableTextFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it.skip('must call `table.setGlobalFilter` for the global filter', async () => {
    const placeholder = 'Buscar em tudo...';

    render(<DataTableTextFilter placeholder={placeholder} />);

    expect(MockInput).toHaveBeenCalledWith(
      expect.objectContaining({ placeholder: placeholder }),
      undefined
    );

    const typedValue = 'teste global';

    fireEvent.change(screen.getByTestId('text-filter-input'), {
      target: { value: typedValue }
    });

    expect(mockSetGlobalFilter).toHaveBeenCalledWith(typedValue);
    expect(mockSetGlobalFilter).toHaveBeenCalledTimes(1);
    expect(mockSetFilterValue).not.toHaveBeenCalled();
  });

  it.skip('must link the value and onChange event to the specific column and call setFilterValue', () => {
    const placeholder = 'Buscar por nome...';

    render(<DataTableTextFilter placeholder={placeholder} column="name" />);

    expect(MockInput).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'valor inicial' }),
      undefined
    );

    expect(mockGetFilterValue).toHaveBeenCalledTimes(1);

    const newValue = 'novo filtro';
    fireEvent.change(screen.getByTestId('text-filter-input'), {
      target: { value: newValue }
    });

    expect(mockSetFilterValue).toHaveBeenCalledWith(newValue);
    expect(mockSetGlobalFilter).not.toHaveBeenCalled();
  });

  it.skip('should fail silently if the column is not found', () => {
    const placeholder = 'Coluna Inexistente';

    render(
      <DataTableTextFilter placeholder={placeholder} column="id-inexistente" />
    );

    fireEvent.change(screen.getByTestId('text-filter-input'), {
      target: { value: 'teste' }
    });

    expect(mockSetFilterValue).not.toHaveBeenCalled();
    expect(MockInput).toHaveBeenCalledWith(
      expect.objectContaining({ value: undefined }),
      undefined
    );
  });
});
