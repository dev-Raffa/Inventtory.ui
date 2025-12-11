import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUser, UserProvider } from './use-user';

const { mockedUseAuth, mockedUseUserProfileQuery } = vi.hoisted(() => {
  return {
    mockedUseAuth: vi.fn(),
    mockedUseUserProfileQuery: vi.fn()
  };
});

vi.mock('@/app/features/auth/hooks/use-auth', () => ({
  useAuth: mockedUseAuth
}));

vi.mock('./use-query', () => ({
  useUserProfileQuery: mockedUseUserProfileQuery
}));

describe('useUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  it('should throw error if used outside UserProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useUser())).toThrow(
      'useUser deve ser usado dentro de um UserProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should return user profile data when query succeeds', () => {
    const mockUser = {
      id: '123',
      email: 'admin@inventto.com',
      fullName: 'Admin User',
      avatarUrl: null
    };

    mockedUseAuth.mockReturnValue({
      session: { user: { id: '123' } }
    });

    mockedUseUserProfileQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should reflect loading state from query', () => {
    mockedUseAuth.mockReturnValue({
      session: { user: { id: '123' } }
    });

    mockedUseUserProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
  });

  it('should expose error when query fails', () => {
    const mockError = new Error('Failed to fetch profile');

    mockedUseAuth.mockReturnValue({
      session: { user: { id: '123' } }
    });

    mockedUseUserProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it('should allow calling refetch function', () => {
    const refetchMock = vi.fn();

    mockedUseAuth.mockReturnValue({
      session: { user: { id: '123' } }
    });

    mockedUseUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchMock
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    result.current.refetch();

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('should handle null session correctly', () => {
    mockedUseAuth.mockReturnValue({
      session: null
    });

    mockedUseUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    });

    renderHook(() => useUser(), { wrapper });

    expect(mockedUseUserProfileQuery).toHaveBeenCalledWith(undefined);
  });
});
