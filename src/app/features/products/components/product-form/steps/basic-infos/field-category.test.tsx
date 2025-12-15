import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockFormData, renderWithProductProvider } from '../../mocks';
import { ProductFormFieldCategory } from './field-category';
import type { ProductFormProviderProps } from '../../hook';

const mocks = vi.hoisted(() => ({
  createCategory: vi.fn()
}));

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
  }),
  useCreateCategoryMutation: () => ({
    mutateAsync: mocks.createCategory
  })
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe('ProductFormFieldCategory (Integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.createCategory.mockResolvedValue({ id: 'new-cat', name: 'Sapatos' });
  });

  it('should render with the placeholder and muted style if there is no value', () => {
    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    expect(combobox).toHaveTextContent('Selecione uma categoria');
    expect(combobox).toHaveClass('text-muted-foreground');
  });

  it('should render with the category name and standard style if a default value exists', () => {
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
    expect(combobox).not.toHaveClass('text-muted-foreground');
  });

  it('must open the popover, list, filter, and select a category', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    expect(searchInput).toBeVisible();

    await user.type(searchInput, 'Rou');

    expect(screen.queryByText('Eletrônicos')).not.toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeVisible();

    await user.click(screen.getByText('Roupas'));

    expect(combobox).toHaveTextContent('Roupas');
    expect(combobox).not.toHaveClass('text-muted-foreground');
  });

  it('should display "Criar nova: ..." when typing a non-existent category', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );
    const novaCategoria = 'Sapatos';

    await user.type(searchInput, novaCategoria);

    expect(screen.getByText(`Criar nova: "${novaCategoria}"`)).toBeVisible();
  });

  it('should NOT display "Criar nova" if there is an exact match', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    await user.type(searchInput, 'Roupas');

    expect(screen.getByText('Roupas')).toBeVisible();
    expect(screen.queryByText(/Criar nova:/)).not.toBeInTheDocument();
  });

  it('should call create mutation when clicking on "Criar nova"', async () => {
    const user = userEvent.setup();

    renderWithProductProvider(<ProductFormFieldCategory />);

    const combobox = screen.getByRole('combobox', { name: 'Categoria' });

    await user.click(combobox);

    const searchInput = await screen.findByPlaceholderText(
      'Pesquisar categoria...'
    );

    await user.type(searchInput, 'Sapatos');

    const createOption = await screen.findByText('Criar nova: "Sapatos"');

    await user.click(createOption);

    expect(mocks.createCategory).toHaveBeenCalledWith('Sapatos');

    await waitFor(() => {
      expect(combobox).toHaveTextContent('Sapatos');
    });
  });
});
