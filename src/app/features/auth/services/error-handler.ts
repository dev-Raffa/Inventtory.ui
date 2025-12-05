import type { AuthError } from '@supabase/supabase-js';

export const handleAuthError = (error: AuthError) => {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    throw new Error('E-mail ou senha incorretos.');
  }

  if (message.includes('user already registered')) {
    throw new Error('Este e-mail já está em uso.');
  }
  if (message.includes('password should be at least')) {
    throw new Error('A senha é muito fraca. Escolha uma senha mais forte.');
  }
  if (message.includes('rate limit')) {
    throw new Error('Muitas tentativas. Aguarde um momento e tente novamente.');
  }
  if (error.status === 500 || error.status === 502) {
    throw new Error('Serviço de autenticação indisponível. Tente mais tarde.');
  }

  throw new Error(error.message || 'Erro desconhecido na autenticação.');
};
