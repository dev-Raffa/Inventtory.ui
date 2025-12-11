import { supabase } from '@/app/config/supabase';
import { CategoryMapper } from './mappers';
import { handleCategoryError } from './error-handler';
import type { Category, CategoryDTO } from '../types';

async function getAll(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })
    .overrideTypes<Array<CategoryDTO>, { merge: false }>();

  if (error) {
    handleCategoryError(error);
  }

  return (data || []).map(CategoryMapper.toDomain);
}

async function create(name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name })
    .select()
    .single()
    .overrideTypes<CategoryDTO, { merge: false }>();

  if (error) {
    handleCategoryError(error);
  }

  if (!data) {
    throw new Error('Erro inesperado: Categoria não retornada.');
  }

  return CategoryMapper.toDomain(data as CategoryDTO);
}

export const CategoryService = {
  getAll,
  create
};
