import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleProductError } from './error-handler';
import { PostgrestError } from '@supabase/supabase-js';

describe('handleProductError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw specific error for duplicate record (23505)', () => {
    const error = {
      code: '23505',
      message: 'Duplicate key value violates unique constraint',
      details: 'Key (sku)=(123) already exists.',
      hint: ''
    } as PostgrestError;

    expect(() => handleProductError(error, 'create')).toThrow(
      'Já existe um produto cadastrado com este Nome ou SKU.'
    );
  });

  it('should throw specific error for foreign key violation (23503)', () => {
    const error = {
      code: '23503',
      message: 'Foreign key violation',
      details: 'Key (category_id)=(123) is not present in table "categories".',
      hint: ''
    } as PostgrestError;

    expect(() => handleProductError(error, 'create')).toThrow(
      'A categoria selecionada não foi encontrada ou é inválida.'
    );
  });

  it('should throw specific error for permission denied (42501)', () => {
    const error = {
      code: '42501',
      message: 'Permission denied',
      details: '',
      hint: ''
    } as PostgrestError;

    expect(() => handleProductError(error, 'delete')).toThrow(
      'Você não tem permissão para realizar alterações no catálogo de produtos.'
    );
  });

  it('should detect network errors based on message content', () => {
    const error = {
      code: '',
      message: 'Network request failed',
      details: '',
      hint: ''
    } as PostgrestError;

    expect(() => handleProductError(error, 'fetch')).toThrow(
      'Erro de conexão. Verifique sua internet.'
    );
  });

  it('should throw generic fallback error for unknown Postgrest error codes', () => {
    const error = {
      code: 'UNKNOWN_CODE',
      message: 'Some internal database error',
      details: 'Details here',
      hint: ''
    } as PostgrestError;

    expect(() => handleProductError(error, 'update')).toThrow(
      'Ocorreu um erro inesperado ao processar o produto.'
    );
  });

  it('should rethrow standard Error messages', () => {
    const error = new Error('Custom validation failed');
    expect(() => handleProductError(error, 'validate')).toThrow(
      'Custom validation failed'
    );
  });

  it('should throw generic fallback error for unknown objects', () => {
    expect(() => handleProductError({ some: 'unknown error' }, 'test')).toThrow(
      'Ocorreu um erro inesperado ao processar o produto.'
    );
  });
});
