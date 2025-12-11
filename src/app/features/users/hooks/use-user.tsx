import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/app/features/auth/hooks/use-auth';
import type { User } from '../types';
import { useUserProfileQuery } from './use-query';

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch
  } = useUserProfileQuery(userId);

  const value = useMemo<UserContextType>(
    () => ({
      user,
      isLoading,
      isError,
      error,
      refetch
    }),
    [user, isLoading, isError, error, refetch]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
}
