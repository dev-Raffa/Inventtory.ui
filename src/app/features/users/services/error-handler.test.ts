import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleUserError } from './error-handler';
import { PostgrestError } from '@supabase/supabase-js';

describe('handleUserError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw specific error for duplicate record (23505)', () => {
    const error = {
      code: '23505',
      message: 'Duplicate key',
      details: 'Key exists',
      hint: ''
    } as PostgrestError;

    expect(() => handleUserError(error, 'test')).toThrow(
      'Este registro já existe no sistema.'
    );
  });

  it('should throw specific error for permission denied (42501)', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: 'RLS policy violation',
      hint: ''
    } as PostgrestError;

    expect(() => handleUserError(error, 'test')).toThrow(
      'Você não tem permissão para realizar esta alteração.'
    );
  });

  it('should rethrow standard Error messages', () => {
    const error = new Error('Custom validation failed');
    expect(() => handleUserError(error, 'test')).toThrow(
      'Custom validation failed'
    );
  });

  it('should throw generic fallback error for unknown objects', () => {
    expect(() => handleUserError({ some: 'object' }, 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar os dados do usuário.'
    );
  });

  it('should throw generic fallback if PostgrestError code is unhandled but it is not an Error instance', () => {
    const error = {
      code: 'UNKNOWN',
      message: 'Some DB error',
      details: '',
      hint: ''
    } as PostgrestError;

    expect(() => handleUserError(error, 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar os dados do usuário.'
    );
  });
});
