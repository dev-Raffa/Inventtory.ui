import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './index';
import type { SignInPayload, SignUpPayload } from '../types';

const {
  mockSupabase,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockGetSession,
  mockOnAuthStateChange
} = vi.hoisted(() => {
  const mockSignInWithPassword = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn();

  return {
    mockSignInWithPassword,
    mockSignUp,
    mockSignOut,
    mockGetSession,
    mockOnAuthStateChange,
    mockSupabase: {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange
      }
    }
  };
});

vi.mock('@/app/config/supabase', () => ({
  supabase: mockSupabase
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    const credentials: SignInPayload = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should call signInWithPassword and return user data on success', async () => {
      const mockData = {
        user: { id: '123', email: credentials.email },
        session: {}
      };

      mockSignInWithPassword.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await AuthService.signIn(credentials);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(
        credentials
      );
      expect(result).toEqual(mockData);
    });

    it('should throw specific error when signIn fails', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials', status: 400 }
      });

      await expect(AuthService.signIn(credentials)).rejects.toThrow(
        'E-mail ou senha incorretos.'
      );
    });
  });

  describe('signUp', () => {
    const payload: SignUpPayload = {
      email: 'new@example.com',
      password: 'strongPassword',
      fullName: 'New User',
      companyName: 'New Company'
    };

    it('should call signUp with correct metadata and return data on success', async () => {
      const mockResponse = {
        data: { user: { id: 'abc-123', email: payload.email } },
        error: null
      };

      mockSignUp.mockResolvedValue(mockResponse);

      const result = await AuthService.signUp(payload);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: payload.email,
        password: payload.password,
        options: {
          data: expect.objectContaining({
            full_name: payload.fullName,
            company_name: payload.companyName,
            company_slug: 'new-company'
          })
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if user creation returns no user object', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(AuthService.signUp(payload)).rejects.toThrow(
        'Erro ao criar usuário de autenticação.'
      );
    });

    it('should handle Supabase auth errors during signup', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' }
      });

      await expect(AuthService.signUp(payload)).rejects.toThrow(
        'Este e-mail já está em uso.'
      );
    });
  });

  describe('signOut', () => {
    it('should call signOut successfully', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await expect(AuthService.signOut()).resolves.not.toThrow();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error if signOut fails', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Network error' } });

      await expect(AuthService.signOut()).rejects.toThrow(
        'Falha ao sair do sistema.'
      );
    });
  });

  describe('getSession', () => {
    it('should return the session from supabase', async () => {
      const mockSession = { access_token: 'token-123' };

      mockGetSession.mockResolvedValue({ data: { session: mockSession } });

      const result = await AuthService.getSession();

      expect(result).toEqual({ data: { session: mockSession } });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if session exists', async () => {
      mockGetSession.mockResolvedValue({ data: { session: { user: {} } } });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if no session exists', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('subscribeToAuthChanges', () => {
    it('should subscribe, invoke callback on event, and return unsubscribe function', async () => {
      const mockUnsubscribe = vi.fn();
      const mockInternalCallback = vi.fn();

      let supabaseCallbackCaptured: any;

      mockOnAuthStateChange.mockImplementation((fn: any) => {
        supabaseCallbackCaptured = fn;

        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } }
        };
      });

      const unsubscribe =
        await AuthService.subscribeToAuthChanges(mockInternalCallback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(supabaseCallbackCaptured).toBeDefined();

      const mockSession = { access_token: 'new-token' } as any;

      supabaseCallbackCaptured('SIGNED_IN', mockSession);

      expect(mockInternalCallback).toHaveBeenCalledWith(mockSession);

      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
