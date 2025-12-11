import { describe, it, expect } from 'vitest';
import { handleAuthError } from './error-handler';
import type { AuthError } from '@supabase/supabase-js';

describe('handleAuthError', () => {
  it('should throw "E-mail ou senha incorretos" for invalid credentials', () => {
    const error = {
      message: 'Invalid login credentials',
      name: 'AuthError',
      status: 400
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow('E-mail ou senha incorretos.');
  });

  it('should throw "Este e-mail já está em uso" for user already registered', () => {
    const error = {
      message: 'User already registered',
      name: 'AuthError',
      status: 400
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow('Este e-mail já está em uso.');
  });

  it('should throw "A senha é muito fraca" for weak password', () => {
    const error = {
      message: 'Password should be at least 6 characters',
      name: 'AuthError',
      status: 422
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow(
      'A senha é muito fraca. Escolha uma senha mais forte.'
    );
  });

  it('should throw "Muitas tentativas" for rate limit error', () => {
    const error = {
      message: 'Rate limit exceeded',
      name: 'AuthError',
      status: 429
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow(
      'Muitas tentativas. Aguarde um momento e tente novamente.'
    );
  });

  it('should throw generic service error for 500 status', () => {
    const error = {
      message: 'Database error',
      name: 'AuthError',
      status: 500
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow(
      'Serviço de autenticação indisponível. Tente mais tarde.'
    );
  });

  it('should throw the original message for unknown errors', () => {
    const error = {
      message: 'Something weird happened',
      name: 'AuthError',
      status: 418
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow('Something weird happened');
  });

  it('should throw generic service error for 502 status (Bad Gateway)', () => {
    const error = {
      message: 'Bad Gateway',
      name: 'AuthError',
      status: 502
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow(
      'Serviço de autenticação indisponível. Tente mais tarde.'
    );
  });

  it('should use fallback message when error message is empty', () => {
    const error = {
      message: '',
      name: 'AuthError',
      status: 400
    } as AuthError;

    expect(() => handleAuthError(error)).toThrow(
      'Erro desconhecido na autenticação.'
    );
  });
});
