import { PostgrestError } from '@supabase/supabase-js';

export function handleProductError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em Product Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error('Já existe um produto cadastrado com este Nome ou SKU.');
    }

    if (error.code === '23503') {
      throw new Error(
        'A categoria selecionada não foi encontrada ou é inválida.'
      );
    }

    if (error.code === '42501') {
      throw new Error(
        'Você não tem permissão para realizar alterações no catálogo de produtos.'
      );
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar o produto.');
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}
