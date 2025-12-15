import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductForm } from './index';
import { ProductFormProvider } from './hook';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProductCreateMutation,
  useProductUpdateMutation
} from '../../hooks/use-query';
import {
  useCategoriesQuery,
  useCreateCategoryMutation
} from '../../../category/hooks/use-query';

vi.mock('../../hooks/use-query');
vi.mock('../../../category/hooks/use-query');
vi.mock('@/app/services/image-upload');

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.PointerEvent = MouseEvent as typeof PointerEvent;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderComponent = (mode: 'Create' | 'Edit' = 'Create') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProductFormProvider mode={mode}>
          <ProductForm
            label={mode === 'Create' ? 'Novo Produto' : 'Editar Produto'}
          />
        </ProductFormProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProductForm UI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useProductCreateMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);

    vi.mocked(useProductUpdateMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: [{ id: 'cat-1', name: 'Categoria Teste' }],
      isLoading: false,
      isError: false,
      error: null
    } as any);

    vi.mocked(useCreateCategoryMutation).mockReturnValue({
      mutateAsync: vi.fn()
    } as any);
  });

  it('should render the form with initial state', () => {
    renderComponent('Create');

    expect(screen.getByText('Novo Produto')).toBeInTheDocument();

    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Avançar/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Cancelar/i })
    ).toBeInTheDocument();
  });

  it('should navigate to "Atributos" step when "Has Variants" is toggled and valid data is filled', async () => {
    const user = userEvent.setup();

    renderComponent('Create');

    const variantSwitch = screen.getByRole('switch', {
      name: /Este produto possui variações/i
    });

    await user.click(variantSwitch);
    await user.type(
      screen.getByLabelText(/Nome do Produto/i),
      'Produto Com Variantes'
    );

    const categoryTrigger = screen.getByRole('combobox', {
      name: /Categoria/i
    });

    await user.click(categoryTrigger);

    const categoryOption = await screen.findByText('Categoria Teste');

    await user.click(categoryOption);

    const nextButton = screen.getByRole('button', { name: /Avançar/i });

    await user.click(nextButton);

    expect(await screen.findByText('Atributos')).toBeInTheDocument();
  });

  it('should render correctly in Edit mode', () => {
    renderComponent('Edit');

    expect(screen.getByText('Editar Produto')).toBeInTheDocument();
  });

  it('should show validation errors when attempting to proceed with empty required fields', async () => {
    const user = userEvent.setup();

    renderComponent('Create');

    const nextButton = screen.getByRole('button', { name: /Avançar/i });

    await user.click(nextButton);

    expect(
      await screen.findByText('Nome deve ter no mínimo 3 caracteres.')
    ).toBeInTheDocument();

    expect(
      await screen.findByText('Categoria é obrigatória.')
    ).toBeInTheDocument();
  });
});
