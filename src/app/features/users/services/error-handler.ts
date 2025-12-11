import { PostgrestError } from '@supabase/supabase-js';

export function handleUserError(
  error: PostgrestError | Error | unknown,
  action: string
): never {
  console.error(`Erro em User Service [${action}]:`, error);

  if (isPostgrestError(error)) {
    if (error.code === '23505') {
      throw new Error('Este registro já existe no sistema.');
    }

    if (error.code === '42501') {
      throw new Error('Você não tem permissão para realizar esta alteração.');
    }
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error(
    'Ocorreu um erro inesperado ao processar os dados do usuário.'
  );
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
