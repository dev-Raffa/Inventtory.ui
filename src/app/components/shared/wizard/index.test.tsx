import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router';
import {
  Wizard,
  WizardHeader,
  WizardContent,
  WizardControl,
  useWizard
} from './index';

const UrlLogger = () => {
  const [params] = useSearchParams();
  return <div data-testid="url-logger">{params.get('step')}</div>;
};

const steps = [
  { id: 'step-1', label: 'Step 1', component: <div>Content 1</div> },
  { id: 'step-2', label: 'Step 2', component: <div>Content 2</div> },
  { id: 'step-3', label: 'Step 3', component: <div>Content 3</div> }
];

const CustomControls = () => {
  const { actions } = useWizard();
  return (
    <button onClick={() => actions.goToStep(2)} data-testid="jump-btn">
      Pular para Passo 3
    </button>
  );
};

const renderWizard = (
  props: any = {},
  initialEntries = ['/'],
  extraChildren: any = null
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <UrlLogger />
              <Wizard steps={steps} {...props}>
                <WizardHeader />
                <WizardContent />
                {extraChildren}
                <WizardControl />
              </Wizard>
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Wizard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization and URL Synchronization', () => {
    it('should render the first step if the URL is empty', () => {
      renderWizard();

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    it('should automatically add "?step=step-1" param to URL on mount', async () => {
      renderWizard();

      await waitFor(() => {
        expect(screen.getByTestId('url-logger')).toHaveTextContent('step-1');
      });
    });

    it('should initialize at the correct step if URL has param (e.g., step-2)', () => {
      renderWizard({}, ['/?step=step-2']);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('should fallback to step 1 if URL param is invalid', () => {
      renderWizard({}, ['/?step=invalid-step-id']);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Basic Navigation', () => {
    it('should advance to the next step on "Next" click', async () => {
      const user = userEvent.setup();
      renderWizard();

      const nextButton = screen.getByRole('button', { name: /Avançar/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeInTheDocument();
        expect(screen.getByTestId('url-logger')).toHaveTextContent('step-2');
      });
    });

    it('should return to previous step on "Back" click', async () => {
      const user = userEvent.setup();
      renderWizard({}, ['/?step=step-2']);

      const prevButton = screen.getByRole('button', { name: /Voltar/i });
      await user.click(prevButton);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByTestId('url-logger')).toHaveTextContent('step-1');
    });
  });

  describe('Button Control', () => {
    it('should NOT show "Back" button on the first step', () => {
      renderWizard({}, ['/?step=step-1']);
      expect(
        screen.queryByRole('button', { name: /Voltar/i })
      ).not.toBeInTheDocument();
    });

    it('should NOT show "Next" button on the last step', () => {
      renderWizard({}, ['/?step=step-3']);
      expect(
        screen.queryByRole('button', { name: /Avançar/i })
      ).not.toBeInTheDocument();
    });

    it('should show "Finish" button ONLY on the last step', () => {
      const { unmount } = renderWizard({}, ['/?step=step-2']);
      expect(
        screen.queryByRole('button', { name: /Finalizar/i })
      ).not.toBeInTheDocument();
      unmount();

      renderWizard({}, ['/?step=step-3']);
      expect(
        screen.getByRole('button', { name: /Finalizar/i })
      ).toBeInTheDocument();
    });
  });

  describe('Validation Logic (onBeforeNextStep)', () => {
    it('should block navigation if onBeforeNextStep returns false', async () => {
      const user = userEvent.setup();
      const handleBeforeChange = vi.fn().mockReturnValue(false);

      renderWizard({ onBeforeNextStep: handleBeforeChange });

      await user.click(screen.getByRole('button', { name: /Avançar/i }));

      expect(handleBeforeChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'step-1' })
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should allow navigation if onBeforeNextStep returns true', async () => {
      const user = userEvent.setup();
      const handleBeforeChange = vi.fn().mockReturnValue(true);

      renderWizard({ onBeforeNextStep: handleBeforeChange });

      await user.click(screen.getByRole('button', { name: /Avançar/i }));

      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      });
    });

    it('should show loading state on buttons while validating (Promise)', async () => {
      const user = userEvent.setup();
      const handleBeforeChange = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
        );

      renderWizard({ onBeforeNextStep: handleBeforeChange });

      const nextButton = screen.getByRole('button', { name: /Avançar/i });
      await user.click(nextButton);

      expect(nextButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      });
    });
  });

  describe('Completion & Cancellation', () => {
    it('should call onFinish when clicking "Finish" on the last step', async () => {
      const user = userEvent.setup();
      const handleFinish = vi.fn();

      renderWizard({ onFinish: handleFinish }, ['/?step=step-3']);

      await user.click(screen.getByRole('button', { name: /Finalizar/i }));

      expect(handleFinish).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking "Cancel" (Covering handleCancel)', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      renderWizard({ onCancel: handleCancel });

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Context & Hooks API', () => {
    it('should throw an error if useWizard is used outside of <Wizard>', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const TestComponent = () => {
        useWizard();

        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useWizard deve ser usado dentro de um componente <Wizard>'
      );

      consoleSpy.mockRestore();
    });

    it('should allow programmatic navigation via goToStep(index)', async () => {
      const user = userEvent.setup();

      renderWizard({}, ['/?step=step-1'], <CustomControls />);

      const jumpButton = screen.getByTestId('jump-btn');

      await user.click(jumpButton);
      await waitFor(() => {
        expect(screen.getByText('Content 3')).toBeInTheDocument();
        expect(screen.getByTestId('url-logger')).toHaveTextContent('step-3');
      });
    });

    it('should block goToStep navigation if isLoading is true', async () => {
      const user = userEvent.setup();
      const handleBeforeChange = vi
        .fn()
        .mockImplementation(() => new Promise(() => {}));

      renderWizard(
        { onBeforeNextStep: handleBeforeChange },
        ['/?step=step-1'],
        <CustomControls />
      );

      const nextButton = screen.getByRole('button', { name: /Avançar/i });

      await user.click(nextButton);

      expect(handleBeforeChange).toHaveBeenCalled();

      const jumpButton = screen.getByTestId('jump-btn');

      await user.click(jumpButton);

      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });
});
