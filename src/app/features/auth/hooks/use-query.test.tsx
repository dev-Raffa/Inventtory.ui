import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthService } from '../services';
import {
  useSessionQuery,
  useIsAuthenticatedQuery,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation
} from './use-query';

vi.mock('../services', () => ({
  AuthService: {
    getSession: vi.fn(),
    isAuthenticated: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  }
}));

describe('Auth Queries & Mutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        },
        mutations: {
          retry: false
        }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useSessionQuery', () => {
    it('should call AuthService.getSession', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const { result } = renderHook(() => useSessionQuery(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(AuthService.getSession).toHaveBeenCalled();
    });
  });

  describe('useIsAuthenticatedQuery', () => {
    it('should call AuthService.isAuthenticated', async () => {
      vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);

      const { result } = renderHook(() => useIsAuthenticatedQuery(), {
        wrapper
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(AuthService.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('useSignInMutation', () => {
    it('should call AuthService.signIn and invalidate queries on success', async () => {
      vi.mocked(AuthService.signIn).mockResolvedValue({
        user: { id: '1' }
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useSignInMutation(), { wrapper });

      await result.current.mutateAsync({
        email: 'test@test.com',
        password: '123'
      });

      expect(AuthService.signIn).toHaveBeenCalledWith(
        { email: 'test@test.com', password: '123' },
        expect.anything()
      );

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auth'] });
    });
  });

  describe('useSignUpMutation', () => {
    it('should call AuthService.signUp', async () => {
      vi.mocked(AuthService.signUp).mockResolvedValue({
        user: { id: '2' }
      } as any);

      const { result } = renderHook(() => useSignUpMutation(), { wrapper });

      const payload = {
        email: 'new@test.com',
        password: '123',
        fullName: 'New',
        companyName: 'Corp'
      };

      await result.current.mutateAsync(payload);

      expect(AuthService.signUp).toHaveBeenCalledWith(
        payload,
        expect.anything()
      );
    });
  });

  describe('useSignOutMutation', () => {
    it('should call AuthService.signOut and clear queryClient on success', async () => {
      vi.mocked(AuthService.signOut).mockResolvedValue();

      const clearSpy = vi.spyOn(queryClient, 'clear');
      const { result } = renderHook(() => useSignOutMutation(), { wrapper });

      await result.current.mutateAsync();

      expect(AuthService.signOut).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
