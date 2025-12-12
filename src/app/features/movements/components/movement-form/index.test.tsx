import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovementForm } from './index';
import { useMovementForm } from './hooks';

// 1. Mock do Hook Personalizado (Lógica de Negócio)
vi.mock('./hooks', () => ({
  useMovementForm: vi.fn()
}));

// 2. Mocks dos Componentes Filhos
vi.mock('./components/header', () => ({
  MovementFormHeader: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('./components/product-search', () => ({
  ProductSearch: ({ onSelect }: any) => (
    <div data-testid="mock-product-search">
      {/* Adicionado type="button" para evitar submit acidental */}
      <button
        type="button"
        onClick={() => onSelect({ id: 'prod-1' })}
        data-testid="btn-select-product"
      >
        Selecionar Produto
      </button>
    </div>
  )
}));

vi.mock('./components/movement-batch-list', () => ({
  MovementBatchList: () => (
    <div data-testid="mock-batch-list">Lista de Itens</div>
  )
}));

vi.mock('./components/footer', () => ({
  MovementFormFooter: () => (
    <div data-testid="mock-footer">
      <button type="submit" data-testid="btn-submit">
        Salvar
      </button>
    </div>
  )
}));

vi.mock('./components/add-items-dialog', () => ({
  AddItemsDialog: ({ open, onAdd, onOpenChange }: any) =>
    open ? (
      <div data-testid="mock-dialog">
        <h1>Dialog Aberto</h1>
        {/* IMPORTANTE: type="button" previne que esses botões submetam o form pai */}
        <button
          type="button"
          onClick={() => onAdd([{ productId: '1', quantity: 1 }])}
          data-testid="btn-confirm-add"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          data-testid="btn-close-dialog"
        >
          Fechar
        </button>
      </div>
    ) : null
}));

describe('MovementForm', () => {
  const mockSubmit = vi.fn();
  const mockAddItem = vi.fn();
  const mockToggleDialog = vi.fn();
  const mockSelectProduct = vi.fn();

  // Mock do handleSubmit do React Hook Form com proteção
  const mockHandleSubmit = vi.fn((fn) => (e: any) => {
    e?.preventDefault();
    if (typeof fn === 'function') {
      fn();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup do mock respeitando a interface MovementFormContextType
    (useMovementForm as any).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        control: {},
        watch: vi.fn().mockReturnValue([]),
        setValue: vi.fn(),
        getValues: vi.fn()
      },
      actions: {
        submit: mockSubmit,
        addItem: mockAddItem,
        toggleDialog: mockToggleDialog,
        selectProduct: mockSelectProduct
      },
      products: [],
      selectedProduct: null,
      isDialogOpen: false
    });
  });

  it('should render the form structure correctly', () => {
    render(<MovementForm />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-product-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-batch-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
  });

  it('should render MovementBatchList when items exist', () => {
    (useMovementForm as any).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([{ id: '1' }])
      },
      actions: { submit: mockSubmit },
      products: [],
      selectedProduct: null,
      isDialogOpen: false
    });

    render(<MovementForm />);

    expect(screen.getByTestId('mock-batch-list')).toBeInTheDocument();
  });

  it('should open the AddItemsDialog when isDialogOpen is true', () => {
    (useMovementForm as any).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([])
      },
      actions: {
        submit: mockSubmit,
        toggleDialog: mockToggleDialog,
        addItem: mockAddItem
      },
      products: [],
      selectedProduct: { id: 'prod-1' },
      isDialogOpen: true
    });

    render(<MovementForm />);

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
  });

  it('should call selectProduct action when a product is selected', () => {
    render(<MovementForm />);

    fireEvent.click(screen.getByTestId('btn-select-product'));

    expect(mockSelectProduct).toHaveBeenCalledWith({ id: 'prod-1' });
  });

  it('should call addItem action when confirmed in dialog', () => {
    (useMovementForm as any).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([])
      },
      actions: {
        submit: mockSubmit,
        addItem: mockAddItem,
        toggleDialog: mockToggleDialog
      },
      isDialogOpen: true
    });

    render(<MovementForm />);

    fireEvent.click(screen.getByTestId('btn-confirm-add'));

    expect(mockAddItem).toHaveBeenCalled();
  });

  it('should call toggleDialog action when dialog is closed', () => {
    (useMovementForm as any).mockReturnValue({
      form: {
        handleSubmit: mockHandleSubmit,
        watch: vi.fn().mockReturnValue([])
      },
      actions: {
        // CORREÇÃO: Adicionado 'submit' aqui também para evitar crash se o form tentar submeter
        submit: mockSubmit,
        toggleDialog: mockToggleDialog,
        addItem: mockAddItem
      },
      isDialogOpen: true
    });

    render(<MovementForm />);

    fireEvent.click(screen.getByTestId('btn-close-dialog'));

    expect(mockToggleDialog).toHaveBeenCalledWith(false);
  });

  it('should submit the form when Footer save button is clicked', () => {
    render(<MovementForm />);

    const submitBtn = screen.getByTestId('btn-submit');
    fireEvent.click(submitBtn);

    expect(mockHandleSubmit).toHaveBeenCalled();
    expect(mockSubmit).toHaveBeenCalled();
  });
});
