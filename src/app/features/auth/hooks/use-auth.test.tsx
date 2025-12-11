import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './use-auth';
import { AuthService } from '../services';
import type { Session } from '../types';

vi.mock('../services', () => ({
  AuthService: {
    getSession: vi.fn(),
    subscribeToAuthChanges: vi.fn()
  }
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should handle error during initialization (catch block coverage)', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(AuthService.getSession).mockRejectedValue(
      new Error('Network Fail')
    );

    vi.mocked(AuthService.subscribeToAuthChanges).mockResolvedValue(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(consoleError).toHaveBeenCalledWith(
      'Erro na inicialização da auth:',
      expect.any(Error)
    );

    expect(result.current.session).toBeNull();

    consoleError.mockRestore();
  });

  it('should preserve session reference if access_token remains unchanged', async () => {
    const token = 'same-token-123';
    const sessionRef1 = { access_token: token, user: { id: '1' } } as Session;
    const sessionRef2 = {
      access_token: token,
      user: { id: '1', email: 'updated?' }
    } as Session;

    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: sessionRef1 }
    } as any);

    let authCallback: (session: Session | null) => void;

    vi.mocked(AuthService.subscribeToAuthChanges).mockImplementation(
      async (cb) => {
        authCallback = cb;
        return () => {};
      }
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.session).toBe(sessionRef1);

    act(() => {
      if (authCallback) authCallback(sessionRef2);
    });

    expect(result.current.session).toBe(sessionRef1);
    expect(result.current.session).not.toBe(sessionRef2);
  });

  it('should throw error if used outside of AuthProvider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth deve ser usado dentro de um AuthProvider'
    );

    consoleError.mockRestore();
  });

  it('should initialize with loading=true and then finish loading (Unauthenticated)', async () => {
    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: null }
    } as any);

    vi.mocked(AuthService.subscribeToAuthChanges).mockImplementation(
      async () => {
        return () => {};
      }
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should initialize with session if AuthService returns one (Authenticated)', async () => {
    const mockSession = {
      access_token: 'valid-token',
      user: { id: 'user-123', email: 'test@test.com' }
    };

    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: mockSession }
    } as any);

    vi.mocked(AuthService.subscribeToAuthChanges).mockResolvedValue(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should update session when subscribeToAuthChanges triggers', async () => {
    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: null }
    } as any);

    let authCallback: (session: Session | null) => void;

    vi.mocked(AuthService.subscribeToAuthChanges).mockImplementation(
      async (cb) => {
        authCallback = cb;
        return () => {};
      }
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);

    const newSession = {
      access_token: 'new-token',
      user: { id: 'new' }
    } as Session;

    act(() => {
      if (authCallback) authCallback(newSession);
    });

    expect(result.current.session).toEqual(newSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle session expiration (Logout event)', async () => {
    const initialSession = { access_token: 'token', user: { id: '1' } };

    vi.mocked(AuthService.getSession).mockResolvedValue({
      data: { session: initialSession }
    } as any);

    let authCallback: (session: Session | null) => void;

    vi.mocked(AuthService.subscribeToAuthChanges).mockImplementation(
      async (cb) => {
        authCallback = cb;
        return () => {};
      }
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      if (authCallback) authCallback(null);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
