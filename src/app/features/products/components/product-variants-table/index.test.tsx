import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductVariantsTable } from './';

const { MockSimpleDataTable, mockColumns } = vi.hoisted(() => ({
  MockSimpleDataTable: vi.fn(() => (
    <div data-testid="simple-data-table-mock" />
  )),
  mockColumns: [{ accessorKey: 'sku', header: 'SKU' }]
}));

vi.mock('@/app/components/shared/simple-data-table', () => ({
  SimpleDataTable: MockSimpleDataTable
}));

vi.mock('./columns', () => ({
  productVariantsTableColumns: mockColumns
}));

describe('ProductVariantsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve passar dados, colunas e o objeto meta com parentData para SimpleDataTable', () => {
    const mockVariants = [
      { sku: 'V1', name: 'Azul' },
      { sku: 'V2', name: 'Vermelho' }
    ];
    const mockParentRowData = {
      name: 'Produto Principal',
      id: 'P123'
    };

    render(
      <ProductVariantsTable
        // @ts-expect-error - Ignorando a complexidade do tipo TParent no teste
        data={mockVariants}
        parentData={mockParentRowData}
      />
    );

    expect(MockSimpleDataTable).toHaveBeenCalledTimes(1);

    //@ts-expect-error Tuple type '[]' of length '0' has no element at index '0'.
    const props: any = MockSimpleDataTable.mock.calls[0][0];

    expect(props?.data).toBe(mockVariants);
    expect(props?.columns).toBe(mockColumns);
    expect(props?.meta).toEqual({
      parentData: mockParentRowData
    });
  });
});
