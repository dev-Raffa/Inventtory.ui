import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import {
  Wizard,
  WizardHeader,
  WizardContent,
  WizardControl,
  useWizard
} from './index';

const steps = [
  { id: 'step-1', label: 'Dados Pessoais', component: <h1>Passo 1: Dados</h1> },
  { id: 'step-2', label: 'Endereço', component: <h1>Passo 2: Endereço</h1> },
  { id: 'step-3', label: 'Revisão', component: <h1>Passo 3: Revisão</h1> }
];

const WizardContextSpy = ({ onContext }: { onContext: (ctx: any) => void }) => {
  const context = useWizard();

  onContext(context);

  return null;
};

const renderWizard = (
  initialEntries = ['/'],
  props: any = {},
  extraChildren: React.ReactNode = null
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Wizard steps={steps} {...props}>
        <WizardHeader />
        <WizardContent />
        {extraChildren}
        <WizardControl />
      </Wizard>
    </MemoryRouter>
  );
};

describe('Wizard Component', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Navigation Flow (UI Integration)', () => {
    it('should render the first step by default', () => {
      renderWizard();

      expect(
        screen.getByRole('heading', { name: 'Passo 1: Dados' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: /Voltar/i })
      ).not.toBeInTheDocument();
    });

    it('should navigate to the next step when clicking "Next"', async () => {
      const user = userEvent.setup();

      renderWizard();

      const nextBtn = screen.getByRole('button', { name: /Avançar/i });

      await user.click(nextBtn);

      expect(
        await screen.findByRole('heading', { name: 'Passo 2: Endereço' })
      ).toBeInTheDocument();
    });

    it('should navigate back when clicking "Back"', async () => {
      const user = userEvent.setup();

      renderWizard(['/?step=step-2']);

      expect(
        screen.getByRole('heading', { name: 'Passo 2: Endereço' })
      ).toBeInTheDocument();

      const prevBtn = screen.getByRole('button', { name: /Voltar/i });

      await user.click(prevBtn);

      expect(
        await screen.findByRole('heading', { name: 'Passo 1: Dados' })
      ).toBeInTheDocument();
    });
  });

  describe('URL Synchronization', () => {
    it('should initialize correctly based on URL params', () => {
      renderWizard(['/?step=step-3']);

      expect(
        screen.getByRole('heading', { name: 'Passo 3: Revisão' })
      ).toBeInTheDocument();
    });

    it('should fallback to step 1 for invalid URL params', () => {
      renderWizard(['/?step=invalid-step-id']);

      expect(
        screen.getByRole('heading', { name: 'Passo 1: Dados' })
      ).toBeInTheDocument();
    });
  });

  describe('Validation Logic (onBeforeNextStep)', () => {
    it('should block navigation if validation returns false', async () => {
      const user = userEvent.setup();
      const mockValidate = vi.fn().mockReturnValue(false);

      renderWizard(['/'], { onBeforeNextStep: mockValidate });

      await user.click(screen.getByRole('button', { name: /Avançar/i }));

      expect(mockValidate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'step-1' })
      );

      expect(
        screen.getByRole('heading', { name: 'Passo 1: Dados' })
      ).toBeInTheDocument();
    });

    it('should show loading state and wait for async validation', async () => {
      const user = userEvent.setup();

      let resolveValidation: (value: boolean) => void = () => {};
      const validationPromise = new Promise<boolean>((resolve) => {
        resolveValidation = resolve;
      });

      const mockAsyncValidate = vi.fn().mockReturnValue(validationPromise);

      renderWizard(['/'], { onBeforeNextStep: mockAsyncValidate });

      const nextBtn = screen.getByRole('button', { name: /Avançar/i });

      const clickPromise = user.click(nextBtn);

      await waitFor(() => {
        expect(nextBtn).toBeDisabled();
      });

      resolveValidation(true);

      await clickPromise;

      expect(
        await screen.findByRole('heading', { name: 'Passo 2: Endereço' })
      ).toBeInTheDocument();
    });
  });

  describe('Completion', () => {
    it('should call onFinish only on the last step', async () => {
      const user = userEvent.setup();
      const handleFinish = vi.fn();

      renderWizard(['/?step=step-3'], { onFinish: handleFinish });

      const finishBtn = screen.getByRole('button', { name: /Finalizar/i });

      expect(
        screen.queryByRole('button', { name: /Avançar/i })
      ).not.toBeInTheDocument();

      await user.click(finishBtn);

      expect(handleFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('Guard Clauses & Branch Coverage (Whitebox Testing)', () => {
    it('should ignore prevStep() when on the first step', () => {
      let context: any;

      renderWizard(
        ['/'],
        {},
        <WizardContextSpy onContext={(ctx) => (context = ctx)} />
      );

      act(() => {
        context.actions.prevStep();
      });

      expect(context.state.currentStepIndex).toBe(0);
      expect(
        screen.getByRole('heading', { name: 'Passo 1: Dados' })
      ).toBeInTheDocument();
    });

    it('should ignore nextStep() when on the last step (without explicit finish)', () => {
      let context: any;

      renderWizard(
        ['/?step=step-3'],
        {},
        <WizardContextSpy onContext={(ctx) => (context = ctx)} />
      );

      act(() => {
        context.actions.nextStep();
      });

      expect(context.state.currentStepIndex).toBe(2);
      expect(
        screen.getByRole('heading', { name: 'Passo 3: Revisão' })
      ).toBeInTheDocument();
    });

    it('should ignore goToStep() with invalid indices (negative or out of bounds)', () => {
      let context: any;

      renderWizard(
        ['/'],
        {},
        <WizardContextSpy onContext={(ctx) => (context = ctx)} />
      );

      act(() => {
        context.actions.goToStep(-1);
      });

      expect(context.state.currentStepIndex).toBe(0);

      act(() => {
        context.actions.goToStep(99);
      });

      expect(context.state.currentStepIndex).toBe(0);
    });

    it('should ignore all navigation actions while isLoading is true', async () => {
      let context: any;
      const pendingPromise = new Promise(() => {});
      const mockValidate = vi.fn().mockReturnValue(pendingPromise);

      renderWizard(
        ['/'],
        { onBeforeNextStep: mockValidate },
        <WizardContextSpy onContext={(ctx) => (context = ctx)} />
      );

      await act(async () => {
        context.actions.nextStep();
      });

      expect(context.state.isLoading).toBe(true);

      act(() => {
        context.actions.goToStep(2);
        context.actions.prevStep();
        context.actions.nextStep();
        context.actions.handleFinish();
      });

      expect(context.state.currentStepIndex).toBe(0);
      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it('should handle errors thrown outside the provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const BadComponent = () => {
        useWizard();
        return null;
      };

      expect(() => render(<BadComponent />)).toThrow(
        'useWizard deve ser usado dentro de um componente <Wizard>'
      );

      consoleSpy.mockRestore();
    });

    it('should handle cancel action safely when onCancel is undefined', () => {
      let context: any;

      renderWizard(
        ['/'],
        {},
        <WizardContextSpy onContext={(ctx) => (context = ctx)} />
      );

      act(() => {
        context.actions.handleCancel();
      });

      expect(context.state.currentStepIndex).toBe(0);
    });
  });
});
