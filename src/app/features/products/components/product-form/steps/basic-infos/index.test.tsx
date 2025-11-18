import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductBasicInfo } from '.';
import { renderWithProductProvider, mockFormData } from '../../mocks';
import type { ProductFormProviderProps } from '../../hook';

vi.mock('./field-category', () => ({
  ProductFormFieldCategory: () => (
    <div data-testid="mock-category-field">Mock Category</div>
  )
}));

vi.mock('./field-product-images', () => ({
  ProductFormFieldImages: () => (
    <div data-testid="mock-images-field">Mock Images</div>
  )
}));

describe('ProductBasicInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('must render all fields and child components in "Create" mode.', () => {
    renderWithProductProvider(<ProductBasicInfo />);

    expect(screen.getByLabelText('Nome do Produto')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU Principal')).toBeInTheDocument();
    expect(screen.getByLabelText('Estoque mínimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Este produto possui variações?')
    ).toBeInTheDocument();

    expect(screen.getByTestId('mock-category-field')).toBeInTheDocument();
    expect(screen.getByTestId('mock-images-field')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do Produto')).toBeEnabled();
    expect(screen.getByLabelText('SKU Principal')).toBeEnabled();
  });

  it('should allow typing in the text and number fields.', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductBasicInfo />);

    const nameInput = screen.getByLabelText('Nome do Produto');
    const skuInput = screen.getByLabelText('SKU Principal');
    const stockInput = screen.getByLabelText('Estoque mínimo');
    const descInput = screen.getByLabelText('Descrição');

    await user.type(nameInput, 'Camiseta');
    await user.clear(skuInput);
    await user.type(skuInput, 'CAM-001');
    await user.type(stockInput, '15');
    await user.type(descInput, 'Uma descrição legal');

    expect(nameInput).toHaveValue('Camiseta');
    expect(skuInput).toHaveValue('CAM-001');
    expect(stockInput).toHaveValue(15);
    expect(descInput).toHaveValue('Uma descrição legal');
  });

  it('must disable Name and SKU in "Edit" mode.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit' as const,
      product: {
        ...mockFormData,
        hasVariants: false,
        name: 'Produto Existente',
        sku: 'SKU-EXISTENTE'
      }
    };

    renderWithProductProvider(<ProductBasicInfo />, { providerProps });

    const nameInput = screen.getByLabelText('Nome do Produto');
    const skuInput = screen.getByLabelText('SKU Principal');

    expect(nameInput).toHaveValue('Produto Existente');
    expect(skuInput).toHaveValue('SKU-EXISTENTE');
    expect(nameInput).toBeDisabled();
    expect(skuInput).toBeDisabled();
  });

  it('must convert the Minimum Stock input to a number.', async () => {
    const user = userEvent.setup();
    renderWithProductProvider(<ProductBasicInfo />);

    const stockInput = screen.getByLabelText('Estoque mínimo');

    await user.type(stockInput, '10');
    expect(stockInput).toHaveValue(10);

    await user.clear(stockInput);
    expect(stockInput).toHaveValue(null);
  });

  describe('Logic of the "HasVariants" Switch', () => {
    it('must be enabled in "Create" mode', () => {
      renderWithProductProvider(<ProductBasicInfo />);
      const switchElement = screen.getByLabelText(
        'Este produto possui variações?'
      );
      expect(switchElement).toBeEnabled();
    });

    it('should be disabled in "Edit" mode if the product ALREADY has variants (hasVariants: true).', () => {
      const providerProps: Partial<ProductFormProviderProps> = {
        mode: 'Edit' as const,
        // @ts-expect-error product
        product: {
          ...mockFormData,
          hasVariants: true
        }
      };

      renderWithProductProvider(<ProductBasicInfo />, { providerProps });

      const switchElement = screen.getByLabelText(
        'Este produto possui variações?'
      );

      expect(switchElement).toBeDisabled();
      expect(switchElement).toBeChecked();
    });

    it(' must be enabled in "Edit" mode if the product has NO variants (hasVariants: false).', () => {
      const providerProps: Partial<ProductFormProviderProps> = {
        mode: 'Edit' as const,
        product: {
          ...mockFormData,
          hasVariants: false
        }
      };

      renderWithProductProvider(<ProductBasicInfo />, { providerProps });

      const switchElement = screen.getByLabelText(
        'Este produto possui variações?'
      );

      expect(switchElement).toBeEnabled();
      expect(switchElement).not.toBeChecked();
    });
  });
});
