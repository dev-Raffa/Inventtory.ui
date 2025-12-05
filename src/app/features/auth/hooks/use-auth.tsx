import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  useContext
} from 'react';
import { AuthService } from '../services';
import type { AuthContextType, Session } from '../types';
import { UserService } from '../../users/services';
import type { User } from '../../users/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserProfile = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setUser(null);

        return;
      }

      try {
        const userId = currentSession.user.id;
        const userProfile = await UserService.getProfile(userId);

        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setUser(null);
      }
    },
    []
  );

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        const { data } = await AuthService.getSession();

        setSession(data.session);

        if (data.session) {
          await refreshUserProfile(data.session);
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
      } finally {
        setIsLoading(false);
      }

      const subscriptionResponse = await AuthService.subscribeToAuthChanges(
        async (newSession) => {
          setSession((prevSession) => {
            if (prevSession?.access_token === newSession?.access_token) {
              return prevSession;
            }

            return newSession;
          });

          if (newSession) {
            await refreshUserProfile(newSession);
          } else {
            setUser(null);
          }

          setIsLoading(false);
        }
      );

      unsubscribe = subscriptionResponse;
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [refreshUserProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      isAuthenticated: !!session,
      isLoading
    }),
    [session, user, isLoading]
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
