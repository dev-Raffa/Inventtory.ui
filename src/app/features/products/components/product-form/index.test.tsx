import { screen, render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductForm } from './index';

const { mockUseProductForm } = vi.hoisted(() => {
  return {
    mockUseProductForm: vi.fn()
  };
});

vi.mock('./hook', () => ({
  useProductForm: mockUseProductForm
}));

vi.mock('@/app/components/shared/wizard', () => ({
  Wizard: ({ children, steps, onCancel, onBeforeNextStep }: any) => (
    <div data-testid="wizard-root">
      <div data-testid="steps-count">{steps?.length}</div>
      <button data-testid="wizard-cancel-btn" onClick={onCancel}>
        Cancel Trigger
      </button>
      <button data-testid="wizard-next-btn" onClick={onBeforeNextStep}>
        Next Trigger
      </button>
      {children}
    </div>
  ),
  WizardHeader: ({ label }: any) => (
    <div data-testid="wizard-header">{label}</div>
  ),
  WizardContent: () => <div data-testid="wizard-content">Content</div>,
  WizardControl: () => <div data-testid="wizard-control">Controls</div>
}));

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockHandleNextStep = vi.fn();
  const mockSteps = [
    { id: '1', label: 'Step 1', component: <div /> },
    { id: '2', label: 'Step 2', component: <div /> }
  ];

  const mockForm = {
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault();
      fn();
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProductForm.mockReturnValue({
      form: mockForm,
      steps: mockSteps,
      onSubmit: mockOnSubmit,
      onCancel: mockOnCancel,
      handleNextStep: mockHandleNextStep
    });
  });

  it('should render the form structure and Wizard components', () => {
    render(<ProductForm label="Criar Produto" />);

    const form = document.querySelector('form');

    expect(form).toBeInTheDocument();
    expect(screen.getByTestId('wizard-root')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-header')).toHaveTextContent(
      'Criar Produto'
    );
    expect(screen.getByTestId('wizard-content')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-control')).toBeInTheDocument();
  });

  it('should pass the correct props to the Wizard', () => {
    render(<ProductForm label="Criar Produto" />);

    expect(screen.getByTestId('steps-count')).toHaveTextContent('2');
  });

  it('should call onCancel when the Wizard triggers cancel', () => {
    render(<ProductForm label="Criar Produto" />);

    const cancelBtn = screen.getByTestId('wizard-cancel-btn');
    fireEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call handleNextStep when the Wizard triggers next step validation', () => {
    render(<ProductForm label="Criar Produto" />);

    const nextBtn = screen.getByTestId('wizard-next-btn');
    fireEvent.click(nextBtn);

    expect(mockHandleNextStep).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit when the form is submitted', () => {
    render(<ProductForm label="Criar Produto" />);

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});
