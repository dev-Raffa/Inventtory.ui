import {
  createContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
  useContext
} from 'react';
import { AuthService } from '../services';
import type { AuthContextType, Session } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        const { data } = await AuthService.getSession();

        setSession(data.session);
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
      } finally {
        setIsLoading(false);
      }

      const subscriptionResponse = await AuthService.subscribeToAuthChanges(
        (newSession) => {
          setSession((prevSession) => {
            if (prevSession?.access_token === newSession?.access_token) {
              return prevSession;
            }
            return newSession;
          });

          setIsLoading(false);
        }
      );

      unsubscribe = subscriptionResponse;
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      authUser: null,
      isAuthenticated: !!session,
      isLoading
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
