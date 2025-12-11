import {
  render,
  screen,
  waitFor,
  act,
  renderHook
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUpForm } from './index';
import { useSignUpForm, SignUpFormProvider } from './hook';
import { MemoryRouter } from 'react-router';

const mockMutateAsync = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/use-query', () => ({
  useSignUpMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/app/components/shared/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('SignUpForm Feature', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillStepOne = async (isCnpj = false, skipCorporateName = false) => {
    const companyInput = screen.getByLabelText(/nome fantasia/i);
    const docInput = screen.getByLabelText(/documento/i);

    await user.type(companyInput, 'Inventto Tech');

    if (isCnpj) {
      await user.type(docInput, '33.400.689/0001-09');
      if (!skipCorporateName) {
        await waitFor(() =>
          expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
        );

        await user.type(
          screen.getByLabelText(/razão social/i),
          'Inventto Ltda'
        );
      }
    } else {
      await user.type(docInput, '123.456.789-09');
    }
  };

  describe('Integration Tests (UI Flow)', () => {
    const renderComponent = () => {
      return render(
        <MemoryRouter initialEntries={['/auth/signup']}>
          <SignUpForm />
        </MemoryRouter>
      );
    };

    it('should navigate to login when "Already have account" (Cancel) is clicked', async () => {
      renderComponent();

      const cancelBtn = screen.getByRole('button', { name: /já tenho conta/i });

      await user.click(cancelBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });

    it('should validate Step 1 and prevent navigation if empty', async () => {
      renderComponent();

      const nextBtn = screen.getByRole('button', { name: /próximo/i });

      await user.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/o nome fantasia é obrigatório/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/^senha$/i)).not.toBeInTheDocument();
    });

    it('should prevent navigation if CNPJ is present but Corporate Name is missing (Schema Coverage)', async () => {
      renderComponent();

      await fillStepOne(true, true);

      const nextBtn = screen.getByRole('button', { name: /próximo/i });

      await user.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/a razão social é obrigatória para cnpj/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/^senha$/i)).not.toBeInTheDocument();
    });

    it('should navigate to Step 2 after valid Step 1', async () => {
      renderComponent();

      await fillStepOne(false);

      const nextBtn = screen.getByRole('button', { name: /próximo/i });

      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });
    });

    it('should submit form with correct payload (Happy Path)', async () => {
      mockMutateAsync.mockResolvedValue({});

      renderComponent();

      await fillStepOne(false);
      await user.click(screen.getByRole('button', { name: /próximo/i }));

      await waitFor(() =>
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText(/nome completo/i), 'Admin');
      await user.type(screen.getByLabelText(/e-mail/i), 'admin@test.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'Pass123!');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'Pass123!');
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            companyName: 'Inventto Tech',
            document: expect.stringContaining('123'),
            fullName: 'Admin'
          })
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Unit Tests (Hook Logic & Edge Cases)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SignUpFormProvider>{children}</SignUpFormProvider>
      </MemoryRouter>
    );

    it('should throw error if hook is used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => renderHook(() => useSignUpForm())).toThrow(
        'useSignUpForm deve ser usado dentro de um SignUpFormProvider'
      );

      consoleSpy.mockRestore();
    });

    it('should validate specific fields for "user" step manually', async () => {
      const { result } = renderHook(() => useSignUpForm(), { wrapper });
      const triggerSpy = vi.spyOn(result.current.form, 'trigger');

      await act(async () => {
        await result.current.actions.handleBeforeNextStep({
          id: 'user',
          label: 'Dados',
          component: null
        });
      });

      expect(triggerSpy).toHaveBeenCalledWith([
        'fullName',
        'email',
        'password',
        'passwordConfirmation'
      ]);
    });

    it('should return true for unknown steps', async () => {
      const { result } = renderHook(() => useSignUpForm(), { wrapper });

      let isValid;

      await act(async () => {
        isValid = await result.current.actions.handleBeforeNextStep({
          id: 'unknown',
          label: 'Unknown',
          component: null
        });
      });

      expect(isValid).toBe(true);
    });

    it('should handle submit errors gracefully', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useSignUpForm(), { wrapper });

      await act(async () => {
        result.current.form.reset({
          companyName: 'Test Company',
          document: '123.456.789-09',
          corporateName: '',
          slug: 'test-company',
          fullName: 'Valid User',
          email: 'valid@test.com',
          password: 'StrongPass123!',
          passwordConfirmation: 'StrongPass123!'
        });

        await result.current.actions.onSubmit();
      });

      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
