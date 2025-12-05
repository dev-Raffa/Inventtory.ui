import { supabase } from '@/app/config/supabase';
import type { SignInPayload, SignUpPayload, Session } from '../types';
import { toSupabaseMetadata } from './mappers';
import { handleAuthError } from './error-handler';

async function signIn({ email, password }: SignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    handleAuthError(error);
  }

  return data;
}

async function signUp(payload: SignUpPayload) {
  const metadata = toSupabaseMetadata(payload);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: metadata
    }
  });

  if (authError) {
    handleAuthError(authError);
  }

  if (!authData.user) {
    throw new Error('Erro ao criar usuário de autenticação.');
  }

  return authData;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Falha ao sair do sistema.');
}

async function getSession() {
  return await supabase.auth.getSession();
}

async function isAuthenticated() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function subscribeToAuthChanges(
  callback: (session: Session | null) => void
) {
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export const AuthService = {
  signIn,
  signUp,
  signOut,
  getSession,
  isAuthenticated,
  subscribeToAuthChanges
};
