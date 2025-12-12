import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleMovementError } from './error-handler';
import { PostgrestError } from '@supabase/supabase-js';

describe('handleMovementError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw specific error for permission denied (42501)', () => {
    const error = {
      code: '42501',
      message: 'Permission denied'
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Você não tem permissão para realizar movimentações de estoque.'
    );
  });

  it('should throw specific error for foreign key violation (23503)', () => {
    const error = {
      code: '23503',
      message: 'Foreign key violation'
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'O produto ou variação selecionado não foi encontrado no sistema.'
    );
  });

  it('should throw business rule error for P0001 code', () => {
    const error = {
      code: 'P0001',
      message: 'Custom database exception'
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Custom database exception'
    );
  });

  it('should detect network errors based on message content', () => {
    const error = {
      code: '',
      message: 'Network request failed'
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw generic fallback error for unknown Postgrest error codes', () => {
    const error = {
      code: 'XXXXX',
      message: 'Some internal DB error',
      details: '',
      hint: ''
    } as PostgrestError;

    expect(() => handleMovementError(error, 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar a movimentação.'
    );
  });

  it('should throw specific stock error messages', () => {
    const error = new Error('insufficient stock available');

    expect(() => handleMovementError(error, 'test')).toThrow(
      'A operação resultaria em estoque negativo (não permitido).'
    );
  });

  it('should handle generic Javascript errors', () => {
    const error = new Error('Random failure');

    expect(() => handleMovementError(error, 'test')).toThrow('Random failure');
  });

  it('should throw generic fallback error for unknown types', () => {
    expect(() => handleMovementError('unknown string', 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar a movimentação.'
    );
  });
});
