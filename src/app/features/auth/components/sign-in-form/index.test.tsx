import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignInForm } from './index';
import { MemoryRouter } from 'react-router';

const mockMutateAsync = vi.fn();

vi.mock('../../hooks/use-query', () => ({
  useSignInMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

const mockNavigate = vi.fn();
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

describe('SignInForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>
    );
  };

  it('should render the form with all necessary fields', () => {
    renderComponent();
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should display validation errors when submitting empty form', async () => {
    renderComponent();
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/a senha é obrigatória/i)).toBeInTheDocument();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should call mutation and navigate on success', async () => {
    mockMutateAsync.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { user: { id: '1' } };
    });

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@inventto.com');
    await user.type(screen.getByLabelText(/senha/i), 'SecurePass123!');

    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    const clickPromise = user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    await clickPromise;

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'admin@inventto.com',
        password: 'SecurePass123!'
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should handle login error correctly (UX Requirement)', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Invalid credentials'));

    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'admin@inventto.com');
    await user.type(passwordInput, 'WrongPass');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(passwordInput).toHaveValue('');

    await waitFor(() => {
      expect(passwordInput).toHaveFocus();
    });

    expect(emailInput).toHaveValue('admin@inventto.com');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
