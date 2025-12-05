import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services';

export function useSessionQuery() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: AuthService.getSession,
    staleTime: 1000 * 60 * 15,
    retry: false
  });
}

export function useIsAuthenticatedQuery() {
  return useQuery({
    queryKey: ['auth', 'is-authenticated'],
    queryFn: AuthService.isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'signin'],
    mutationFn: AuthService.signIn,
    meta: {
      successMessage: 'Bem-vindo de volta!'
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationKey: ['auth', 'signup'],
    mutationFn: AuthService.signUp,
    meta: {
      successMessage: 'Conta criada com sucesso! Faça login para continuar.'
    }
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'signout'],
    mutationFn: AuthService.signOut,
    meta: {
      successMessage: 'Você saiu do sistema.'
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}
