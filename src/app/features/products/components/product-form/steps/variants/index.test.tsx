import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProductProvider } from '../../mocks';
import { ProductVariants } from './';
import type { ProductFormProviderProps } from '../../hook';
import type { IProductVariant } from '@/app/features/products/types/models';

vi.mock('./field-variant-images', () => ({
  ProductFormFieldVariantImages: ({
    variantIndex
  }: {
    variantIndex: number;
  }) => (
    <div data-testid={`variant-images-${variantIndex}`}>
      Mock Images {variantIndex}
    </div>
  )
}));

const mockVariants: IProductVariant[] = [
  {
    sku: 'SKU-AZUL-P',
    minimumStock: 5,
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'P' }
    ],
    images: []
  },
  {
    sku: 'SKU-AZUL-M',
    minimumStock: 10,
    options: [
      { name: 'Cor', value: 'Azul' },
      { name: 'Tamanho', value: 'M' }
    ],
    images: []
  }
];

describe('ProductVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display the message "No variants generated" when the list is empty', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error - product is incomplete
      product: {
        hasVariants: true,
        variants: []
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    expect(screen.getByText('Nenhuma variante gerada.')).toBeInTheDocument();
    expect(
      screen.getByText('Volte ao Passo 2 para adicionar atributos.')
    ).toBeInTheDocument();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('The table should be rendered with the variants correctly', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      // @ts-expect-error - product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    expect(screen.getByText('Detalhes das Variantes')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Imagens' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Atributos' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'SKU' })
    ).toBeInTheDocument();

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(3);
    expect(screen.getByText(/Cor Azul, Tamanho P/)).toBeInTheDocument();
    expect(screen.getByText(/Cor Azul, Tamanho M/)).toBeInTheDocument();
    expect(screen.getByTestId('variant-images-0')).toBeInTheDocument();
    expect(screen.getByTestId('variant-images-1')).toBeInTheDocument();
  });

  it('should allow editing SKU and Stock in "Create" mode', async () => {
    const user = userEvent.setup();
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Create' as const,
      // @ts-expect-error product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    const skuInputs = screen.getAllByPlaceholderText('SKU da Variação');
    const stockInputs = screen.getAllByPlaceholderText('0');

    expect(skuInputs[0]).toHaveValue('SKU-AZUL-P');
    expect(skuInputs[0]).toBeEnabled();
    expect(stockInputs[0]).toHaveValue(5);

    await user.clear(skuInputs[0]);
    await user.type(skuInputs[0], 'NOVO-SKU');

    await user.clear(stockInputs[0]);
    await user.type(stockInputs[0], '99');

    expect(skuInputs[0]).toHaveValue('NOVO-SKU');
    expect(stockInputs[0]).toHaveValue(99);
  });

  it('must disable SKU editing in "Edit" mode.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit' as const,
      // @ts-expect-error product is incomplete
      product: {
        hasVariants: true,
        variants: mockVariants
      }
    };

    renderWithProductProvider(<ProductVariants />, { providerProps });

    const skuInputs = screen.getAllByPlaceholderText('SKU da Variação');
    const stockInputs = screen.getAllByPlaceholderText('0');

    expect(skuInputs[0]).toBeDisabled();
    expect(skuInputs[0]).toHaveValue('SKU-AZUL-P');
    expect(stockInputs[0]).toBeEnabled();
  });
});
