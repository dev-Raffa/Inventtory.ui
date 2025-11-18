import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductForm } from './';
import { useProductForm } from './hook';

vi.mock('./hook', () => ({
  useProductForm: vi.fn()
}));

vi.mock('@/app/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" data-value={value} />
  )
}));

const mockHookReturn = (overrides = {}) => {
  const defaultReturn = {
    form: {
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault();
        fn();
      }
    },
    stepState: {
      stepIndex: 0,
      totalSteps: 4,
      currentStep: {
        name: 'BasicInfo',
        label: 'Informações Básicas',
        component: <div data-testid="step-content">Conteúdo do Passo 1</div>
      }
    },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    handleNextStep: vi.fn(),
    handlePrevStep: vi.fn(),
    ...overrides
  };

  // @ts-expect-error - Simplificando tipagem para o mock
  vi.mocked(useProductForm).mockReturnValue(defaultReturn);

  return defaultReturn;
};

describe('ProductForm (Orchestrator UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('must render the first step correctly (Back button disabled)', () => {
    mockHookReturn({
      stepState: {
        stepIndex: 0,
        totalSteps: 4,
        currentStep: {
          name: 'BasicInfo',
          label: 'Info',
          component: <div>Step 1</div>
        }
      }
    });

    render(<ProductForm label="Criar Produto" />);

    expect(screen.getByText('Criar Produto')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /Voltar/i });

    expect(backButton).toBeDisabled();

    expect(
      screen.getByRole('button', { name: /Avançar/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /Salvar Produto/i })
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('progress-bar')).toHaveAttribute(
      'data-value',
      '25'
    );
  });

  it('should render an intermediate step (Buttons enabled)', async () => {
    const mockValues = mockHookReturn({
      stepState: {
        stepIndex: 1,
        totalSteps: 4,
        currentStep: {
          name: 'Attributes',
          label: 'Atributos',
          component: <div>Step 2</div>
        }
      }
    });

    render(<ProductForm label="Criar Produto" />);

    const user = userEvent.setup();
    const backButton = screen.getByRole('button', { name: /Voltar/i });
    const nextButton = screen.getByRole('button', { name: /Avançar/i });

    expect(backButton).toBeEnabled();
    expect(nextButton).toBeInTheDocument();

    await user.click(nextButton);
    await user.click(backButton);

    expect(mockValues.handleNextStep).toHaveBeenCalled();
    expect(mockValues.handlePrevStep).toHaveBeenCalled();
  });

  it('The last step should be rendered (Save button visible)', async () => {
    const mockValues = mockHookReturn({
      stepState: {
        stepIndex: 3,
        totalSteps: 4,
        currentStep: {
          name: 'Summary',
          label: 'Resumo',
          component: <div>Resumo</div>
        }
      }
    });

    render(<ProductForm label="Criar Produto" />);

    const user = userEvent.setup();

    expect(
      screen.queryByRole('button', { name: /Avançar/i })
    ).not.toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Salvar Produto/i });

    expect(saveButton).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toHaveAttribute(
      'data-value',
      '100'
    );

    await user.click(saveButton);

    expect(mockValues.onSubmit).toHaveBeenCalled();
  });

  it('The `onCancel` call should be activated when the Cancel button is clicked', async () => {
    const mockValues = mockHookReturn();

    render(<ProductForm label="Criar Produto" />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(mockValues.onCancel).toHaveBeenCalled();
  });
});
