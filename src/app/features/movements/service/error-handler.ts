import { PostgrestError } from '@supabase/supabase-js';

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function handleMovementError(error: unknown, action: string): never {
  console.error(`Erro em Movement Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '42501') {
      throw new Error(
        'Você não tem permissão para realizar movimentações de estoque.'
      );
    }

    if (error.code === '23503') {
      throw new Error(
        'O produto ou variação selecionado não foi encontrado no sistema.'
      );
    }

    if (error.code === 'P0001') {
      throw new Error(
        error.message || 'Erro de regra de negócio no banco de dados.'
      );
    }

    if (error.message.toLowerCase().includes('network')) {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes('insufficient stock') ||
      message.includes('estoque negativo')
    ) {
      throw new Error(
        'A operação resultaria em estoque negativo (não permitido).'
      );
    }

    throw new Error(error.message);
  }

  throw new Error('Ocorreu um erro inesperado ao processar a movimentação.');
}
