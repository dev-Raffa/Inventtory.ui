import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DataTable } from './';

const { mockUseReactTable, MockDataTableContextProvider, mockTableInstance } =
  vi.hoisted(() => {
    const mockTableInstance = {
      getRowModel: vi.fn(),
      someTableMethod: vi.fn()
    };
    const mockUseReactTable = vi.fn(() => mockTableInstance);
    const MockDataTableContextProvider = vi.fn(({ value, children }) => (
      <div
        data-testid="context-provider-wrapper"
        data-table-id={value.table.id}
      >
        {children}
      </div>
    ));

    return {
      mockUseReactTable,
      MockDataTableContextProvider,
      mockTableInstance
    };
  });

vi.mock('@tanstack/react-table', async (importOriginal) => ({
  ...(await importOriginal()),
  useReactTable: mockUseReactTable
}));

vi.mock('../../hook/usetable', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hook/usetable')>();
  return {
    ...actual,
    DataTableContext: {
      ...actual.DataTableContext,
      Provider: MockDataTableContextProvider
    }
  };
});

const mockRenderSubRow = vi.fn();
const mockTableOptions = {
  data: [{ id: 1 }],
  columns: [{ accessorKey: 'id' }]
};

describe('DataTable (Context Provider)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('must call useReactTable with the provided tableOptions', () => {
    render(
      <DataTable
        //@ts-expect-error tableOptions is incompleted to simplify the test
        tableOptions={mockTableOptions}
        renderSubRow={mockRenderSubRow}
      />
    );

    expect(mockUseReactTable).toHaveBeenCalledWith(mockTableOptions);
    expect(mockUseReactTable).toHaveBeenCalledTimes(1);
  });

  it('must provide the table instance and the renderSubRow for the context', () => {
    const mockChildren = <p>Conteúdo da Tabela</p>;

    render(
      <DataTable
        //@ts-expect-error tableOptions is incompleted to simplify the test
        tableOptions={mockTableOptions}
        renderSubRow={mockRenderSubRow}
      >
        {mockChildren}
      </DataTable>
    );

    expect(screen.getByTestId('context-provider-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da Tabela')).toBeInTheDocument();

    const providerProps = MockDataTableContextProvider.mock.calls[0][0];

    expect(providerProps.value).toEqual(
      expect.objectContaining({
        table: mockTableInstance,
        renderSubRow: mockRenderSubRow
      })
    );

    expect(providerProps.children).toBeDefined();
  });
});
