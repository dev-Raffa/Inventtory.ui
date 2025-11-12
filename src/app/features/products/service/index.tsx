import { api } from '@/app/api';
import type { IProduct } from '../types';

const API_ROUTE_URL = '/products';

async function getAll(): Promise<IProduct[]> {
  try {
    const response = await api.get<IProduct[]>(API_ROUTE_URL);

    return response.data.reverse();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);

    throw new Error('Erro ao buscar produtos');
  }
}

async function getOneById(id: string): Promise<IProduct> {
  try {
    const response = await api.get<IProduct>(`${API_ROUTE_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);

    throw new Error('Erro ao buscar o produto');
  }
}

async function add(params: IProduct): Promise<IProduct> {
  try {
    const response = await api.post<IProduct>(API_ROUTE_URL, params);

    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);

    throw new Error('Erro ao adicionar produto');
  }
}

async function update(params: IProduct): Promise<IProduct> {
  try {
    const response = await api.put<IProduct>(
      `${API_ROUTE_URL}/${params.id}`,
      params
    );

    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${params.id}:`, error);

    throw new Error('Erro ao atualizar o produto');
  }
}
export const ProductService = {
  getAll: getAll,
  getOneById: getOneById,
  add: add,
  update: update
};
