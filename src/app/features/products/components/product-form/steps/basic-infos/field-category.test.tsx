import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockFormData, renderWithProductProvider } from '../../mocks';
import { ProductFormFieldCategory } from './field-category';
import type { ProductFormProviderProps } from '../../hook';

const MOCK_CATEGORIES = [
  { id: 'cat1', name: 'Eletrônicos' },
  { id: 'cat2', name: 'Roupas' },
  { id: 'cat3', name: 'Livros' }
];

vi.mock('@/app/features/category/hooks/use-query', () => ({
  useCategoriesQuery: () => ({
    data: MOCK_CATEGORIES,
    isLoading: false,
    isError: false
  })
}));

describe('ProductFormFieldCategory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render with the placeholder "Select a category" if there is no value.', () => {
    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    expect(combobox).toHaveTextContent('Selecione uma categoria');
  });

  it('should render with the category name if a default value exists.', () => {
    const providerProps: Partial<ProductFormProviderProps> = {
      product: {
        ...mockFormData,
        category: MOCK_CATEGORIES[0],
        hasVariants: false
      }
    };

    renderWithProductProvider(<ProductFormFieldCategory />, { providerProps });

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    expect(combobox).toHaveTextContent('Eletrônicos');
  });

  it('must open the popover, list, filter, and select a category.', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    expect(searchInput).toBeVisible();
    expect(screen.getByText('Eletrônicos')).toBeVisible();
    expect(screen.getByText('Roupas')).toBeVisible();
    expect(screen.getByText('Livros')).toBeVisible();

    await user.type(searchInput, 'Rou');

    expect(screen.queryByText('Eletrônicos')).not.toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeVisible();

    await user.click(screen.getByText('Roupas'));
    await waitFor(() => {
      expect(searchInput).not.toBeInTheDocument();
    });

    expect(combobox).toHaveTextContent('Roupas');
  });

  it('The option "Create new category" should be displayed when typing something that does not exist.', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    const novaCategoria = 'Sapatos';

    await user.type(searchInput, novaCategoria);

    expect(
      screen.getByText(`Criar nova categoria: "${novaCategoria}"`)
    ).toBeVisible();
  });

  it('should NOT display "Create new category" if there is an exact match.', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    await user.type(searchInput, 'Roupas');

    expect(screen.getByText('Roupas')).toBeVisible();
    expect(
      screen.queryByText('Criar nova categoria: "Roupas"')
    ).not.toBeInTheDocument();
  });
});
