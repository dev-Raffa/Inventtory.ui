import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDataTable, DataTableContext } from './usetable';
import { type Table, type Row } from '@tanstack/react-table';

const MockTableInstance = {
  getCoreRowModel: vi.fn(),
  setPageSize: vi.fn()
} as unknown as Table<any>;

const MockProvider = ({ children }: { children: React.ReactNode }) => (
  <DataTableContext.Provider
    value={{
      table: MockTableInstance,
      renderSubRow: vi.fn() as (row: Row<any>, index: number) => React.ReactNode
    }}
  >
    {children}
  </DataTableContext.Provider>
);

describe('useDataTable', () => {
  it('should return the context value when used inside a DataTable provider', () => {
    const { result } = renderHook(() => useDataTable<{ id: string }>(), {
      wrapper: MockProvider
    });

    expect(result.current.table).toBe(MockTableInstance);
    expect(result.current.renderSubRow).toBeInstanceOf(Function);
  });

  it('should throw an error when used outside of a DataTable provider (Guard Clause)', () => {
    expect(() => renderHook(() => useDataTable())).toThrow(
      'useDataTable must be used within a DataTable'
    );
  });
});
