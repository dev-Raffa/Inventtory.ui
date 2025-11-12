import { api } from '@/app/api';
import type { ICategory } from '../types';

const apiRouteUrl = '/category';

async function getAll(): Promise<ICategory[]> {
  try {
    const response = await api.get<ICategory[]>(apiRouteUrl);

    return response.data;
  } catch (error) {
    console.error('Falha ao buscar categorias:', error);

    throw new Error('Falha ao buscar categorias');
  }
}

async function create(name: string): Promise<ICategory> {
  try {
    const response = await api.post<ICategory>(apiRouteUrl, { name });

    return response.data;
  } catch (error) {
    console.error('Falha ao criar categoria:', error);

    throw new Error('Falha ao criar categoria');
  }
}

export const CategoryService = {
  getAll: getAll,
  create: create
};
