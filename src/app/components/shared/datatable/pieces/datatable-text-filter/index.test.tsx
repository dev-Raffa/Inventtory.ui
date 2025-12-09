import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act
} from '@testing-library/react';
import { DataTableTextFilter } from './';

const { mockUseDataTable, MockInput, mockSetGlobalFilter, mockSetFilterValue } =
  vi.hoisted(() => {
    const mockSetGlobalFilter = vi.fn();
    const mockSetFilterValue = vi.fn();
    const mockGetFilterValue = vi.fn(() => 'valor inicial');

    const mockColumn = {
      getFilterValue: mockGetFilterValue,
      setFilterValue: mockSetFilterValue
    };

    const mockTable = {
      getState: vi.fn(() => ({ globalFilter: '' })),
      setGlobalFilter: mockSetGlobalFilter,
      getColumn: vi.fn((id) => (id === 'name' ? mockColumn : undefined))
    };

    const mockUseDataTable = vi.fn(() => ({ table: mockTable }));

    const MockInput = vi.fn((props) => (
      <input
        data-testid="text-filter-input"
        {...props}
        onChange={(e) => props.onChange && props.onChange(e)}
        value={props.value ?? ''}
      />
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('must call `table.setGlobalFilter` after debounce delay', async () => {
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

    expect(mockSetGlobalFilter).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetGlobalFilter).toHaveBeenCalledWith(typedValue);
    expect(mockSetGlobalFilter).toHaveBeenCalledTimes(1);
  });

  it('must call setFilterValue for specific column after debounce delay', () => {
    const placeholder = 'Buscar por nome...';
    render(<DataTableTextFilter placeholder={placeholder} column="name" />);

    expect(MockInput).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'valor inicial' }),
      undefined
    );

    const newValue = 'novo filtro';

    fireEvent.change(screen.getByTestId('text-filter-input'), {
      target: { value: newValue }
    });

    expect(mockSetFilterValue).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetFilterValue).toHaveBeenCalledWith(newValue);
    expect(mockSetGlobalFilter).not.toHaveBeenCalled();
  });

  it('should fail silently if the column is not found', () => {
    const placeholder = 'Coluna Inexistente';

    render(
      <DataTableTextFilter placeholder={placeholder} column="id-inexistente" />
    );

    fireEvent.change(screen.getByTestId('text-filter-input'), {
      target: { value: 'teste' }
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSetFilterValue).not.toHaveBeenCalled();
  });
});
