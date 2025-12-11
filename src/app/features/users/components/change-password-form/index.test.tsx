import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ChangePasswordForm } from './index';
import { useChangePassword } from './hook';

const { mockedUseUpdatePasswordMutation } = vi.hoisted(() => {
  return {
    mockedUseUpdatePasswordMutation: vi.fn()
  };
});

vi.mock('../../hooks/use-query', () => ({
  useUpdatePasswordMutation: mockedUseUpdatePasswordMutation
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ChangePasswordForm Feature', () => {
  const user = userEvent.setup();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutate.mockResolvedValue({});

    mockedUseUpdatePasswordMutation.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
      status: 'idle'
    } as any);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const getInputs = () => {
    const inputs = screen.getAllByPlaceholderText('••••••••');

    return {
      passwordInput: inputs[0],
      confirmInput: inputs[1]
    };
  };

  describe('Integration Tests (UI Flow)', () => {
    it('should render fields and buttons correctly', () => {
      render(<ChangePasswordForm />);

      expect(screen.getByText(/^Nova Senha$/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirmar Nova Senha/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      ).toBeInTheDocument();
    });

    it('should toggle password visibility when clicking the icon', async () => {
      render(<ChangePasswordForm />);

      const { passwordInput } = getInputs();
      const toggleBtn = screen.getAllByRole('button', {
        name: /mostrar senha/i
      })[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleBtn);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should toggle confirm password visibility', async () => {
      render(<ChangePasswordForm />);

      const { confirmInput } = getInputs();
      const toggleBtn = screen.getAllByRole('button', {
        name: /mostrar senha/i
      })[1];

      expect(confirmInput).toHaveAttribute('type', 'password');

      await user.click(toggleBtn);

      expect(confirmInput).toHaveAttribute('type', 'text');

      await user.click(toggleBtn);

      expect(confirmInput).toHaveAttribute('type', 'password');
    });

    it('should display validation errors when submitted empty', async () => {
      render(<ChangePasswordForm />);

      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(screen.getAllByText(/caracteres/i).length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should display error when passwords do not match', async () => {
      render(<ChangePasswordForm />);

      const { passwordInput, confirmInput } = getInputs();

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Password123-Diferente');
      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/as senhas não coincidem/i)
        ).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const onCancelMock = vi.fn();

      render(<ChangePasswordForm onCancel={onCancelMock} />);

      await user.click(screen.getByRole('button', { name: /Cancelar/i }));

      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    it('should submit the form with valid data', async () => {
      render(<ChangePasswordForm />);

      const { passwordInput, confirmInput } = getInputs();

      await user.type(passwordInput, 'StrongPass123!');
      await user.type(confirmInput, 'StrongPass123!');
      await user.click(
        screen.getByRole('button', { name: /Atualizar Senha/i })
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          'StrongPass123!',
          expect.objectContaining({
            onSuccess: expect.any(Function)
          })
        );
      });
    });

    it('should disable fields during submission (Loading)', () => {
      mockedUseUpdatePasswordMutation.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: true
      } as any);

      render(<ChangePasswordForm />);

      const { passwordInput } = getInputs();

      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Unit Tests (Hook Logic)', () => {
    it('should reset form and call onSuccess after mutation success', async () => {
      const onSuccessExternal = vi.fn();
      const { result } = renderHook(() =>
        useChangePassword({ onSuccess: onSuccessExternal })
      );

      await act(async () => {
        await result.current.handleSubmit({
          password: 'ValidPass123!',
          confirmPassword: 'ValidPass123!'
        });
      });

      expect(mockMutate).toHaveBeenCalled();

      const mutationOptions = mockMutate.mock.calls[0][1];

      act(() => {
        mutationOptions.onSuccess();
      });

      expect(onSuccessExternal).toHaveBeenCalled();
    });

    it('should execute success flow without errors even without defined onSuccess callback', async () => {
      const { result } = renderHook(() => useChangePassword({}));

      await act(async () => {
        await result.current.handleSubmit({
          password: 'ValidPass123!',
          confirmPassword: 'ValidPass123!'
        });
      });

      expect(mockMutate).toHaveBeenCalled();

      const mutationOptions = mockMutate.mock.calls[0][1];

      expect(() => {
        act(() => {
          mutationOptions.onSuccess();
        });
      }).not.toThrow();
    });
  });
});
