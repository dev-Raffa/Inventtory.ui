import { screen, fireEvent } from '@testing-library/react';
import { ProductsFormFieldAttributeValues } from './field-attribute-values';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProductProvider } from '../../mocks';

vi.mock('../../utils', () => ({
  ...vi.importActual('../../utils'),
  parseValues: (value: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
}));

describe('ProductsFormFieldAttributeValues', () => {
  it('should render badges as the user types.', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues name="attributes.0.values" />
    );

    const input = screen.getByLabelText('Valores');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Pequeno, Medio, Grande' } });

    expect(screen.getByText('Pequeno')).toBeInTheDocument();
    expect(screen.getByText('Medio')).toBeInTheDocument();
    expect(screen.getByText('Grande')).toBeInTheDocument();
  });

  it('should remove extra spaces', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues name="attributes.0.values" />
    );
    const input = screen.getByLabelText('Valores');

    fireEvent.change(input, { target: { value: ' Vermelho , Azul ' } });

    expect(screen.getByText('Vermelho')).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it('should remove the badges when the input is cleared.', () => {
    renderWithProductProvider(
      <ProductsFormFieldAttributeValues name="attributes.0.values" />
    );
    const input = screen.getByLabelText('Valores');

    fireEvent.change(input, { target: { value: 'Pequeno, Medio' } });
    expect(screen.getByText('Pequeno')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });

    expect(screen.queryByText('Pequeno')).not.toBeInTheDocument();
    expect(screen.queryByText('Medio')).not.toBeInTheDocument();
  });
});
