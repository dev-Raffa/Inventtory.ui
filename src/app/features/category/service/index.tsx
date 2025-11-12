import { supabase } from '@/app/config/supabase';
import type { ICategory } from '../types';

async function getAll(): Promise<ICategory[]> {
  const { data, error } = await supabase.from('categories').select('id, name');

  if (error) {
    throw new Error('Falha ao buscar categorias');
  }

  return data || [];
}

async function create(name: string): Promise<ICategory> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name })
    .select()
    .single();

  if (error) {
    throw new Error('Falha ao criar categoria');
  }

  return data;
}

export const CategoryService = {
  getAll: getAll,
  create: create
};
