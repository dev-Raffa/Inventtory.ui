import { PostgrestError } from '@supabase/supabase-js';

export const handleCategoryError = (error: PostgrestError) => {
  const message = error.message.toLowerCase();
  const code = error.code;

  if (code === '23505') {
    throw new Error('Já existe uma categoria com este nome.');
  }

  if (message.includes('network')) {
    throw new Error('Erro de conexão. Verifique sua internet.');
  }

  throw new Error('Não foi possível realizar a operação. Tente novamente.');
};
