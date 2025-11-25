import type { ReactNode } from 'react';
import type { IProduct } from '../../../types/models';

export type ProductFormStep = {
  id: 'BasicInfo' | 'Attributes' | 'Variants' | 'Summary';
  label: 'Informações Básicas' | 'Atributos' | 'Variantes' | 'Resumo';
  component: ReactNode;
};

export type TProductFormModes = 'Create' | 'Edit' | 'View';

export type TProductForm = {
  product?: IProduct;
  mode: TProductFormModes;
  label: string;
};
