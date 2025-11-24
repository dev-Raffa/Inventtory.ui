import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductAttributes } from './index';
import { mockFormData } from '../../mocks';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { type ProductFormProviderProps, ProductFormProvider } from '../../hook';

type RenderWithProviderProps = {
  providerProps?: Partial<ProductFormProviderProps>;
};

const createTestWrapper = (props: RenderWithProviderProps = {}) => {
  const { providerProps } = props;
  const queryClient = new QueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductFormProvider mode="Create" {...providerProps}>
          {children}
        </ProductFormProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return Wrapper;
};

export const renderWithProductProvider = (
  ui: ReactElement,
  options: RenderWithProviderProps & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const { providerProps, ...renderOptions } = options;
  const wrapper = createTestWrapper({ providerProps });
  return render(ui, { wrapper, ...renderOptions });
};

vi.mock('./field-attribute-values', () => ({
  ProductsFormFieldAttributeValues: () => <div>Mock de Attribute Values</div>
}));

describe('ProductAttributes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the initial empty state (without attributes).', () => {
    renderWithProductProvider(<ProductAttributes />);

    expect(screen.getByText('Attributos')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '+ Adicionar atributo' })
    ).toBeInTheDocument();

    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('must add and remove an attribute in "Create" mode.', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductAttributes />);

    const addButton = screen.getByRole('button', {
      name: '+ Adicionar atributo'
    });

    await user.click(addButton);

    const nomeInput = await screen.findByLabelText('Nome');
    const removeButton = screen.getByLabelText('Remover atributo');

    expect(nomeInput).toBeInTheDocument();
    expect(removeButton).toBeInTheDocument();
    expect(nomeInput).toBeEnabled();

    await user.click(addButton);

    expect(screen.getAllByLabelText('Nome')).toHaveLength(2);

    const allRemoveButtons = screen.getAllByLabelText('Remover atributo');

    await user.click(allRemoveButtons[0]);

    expect(screen.getAllByLabelText('Nome')).toHaveLength(1);
  });

  it('The attributes should be displayed in "Edit" mode, and the fields should be disabled.', async () => {
    const mockAttributes = [
      { name: 'Cor', values: 'Azul, Verde' },
      { name: 'Tamanho', values: 'P, M' }
    ];

    const providerProps: Partial<ProductFormProviderProps> = {
      mode: 'Edit',
      product: {
        ...mockFormData,
        hasVariants: true,
        attributes: mockAttributes,
        variants: []
      }
    };

    renderWithProductProvider(<ProductAttributes />, { providerProps });

    const nomeInputs = await screen.findAllByLabelText('Nome');

    expect(nomeInputs).toHaveLength(2);
    expect(screen.getByDisplayValue('Cor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tamanho')).toBeInTheDocument();
    expect(screen.queryByLabelText('Remover atributo')).not.toBeInTheDocument();
    expect(nomeInputs[0]).toBeDisabled();
    expect(nomeInputs[1]).toBeDisabled();
  });
});
