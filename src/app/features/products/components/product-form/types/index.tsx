import type { ReactNode } from 'react';
import type { ProductFormData } from '../schema';
import type { IProduct } from '../../../types/models';

export type ProductFormStep = {
  name: 'BasicInfo' | 'Attributes' | 'Variants' | 'Summary';
  label: 'Informações Básicas' | 'Atributos' | 'Variantes' | 'Resumo';
  component: ReactNode;
  fields?: (keyof ProductFormData)[];
};

export type TProductFormModes = 'Create' | 'Edit' | 'View';

export type TProductForm = {
  product?: IProduct;
  mode: TProductFormModes;
  label: string;
};
