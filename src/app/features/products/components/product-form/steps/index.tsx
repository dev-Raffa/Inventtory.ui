import type { ProductFormStep } from '../types';
import { ProductBasicInfo } from './basic-infos';
import { ProductAttributes } from './attributes';
import { ProductVariants } from './variants';
import { ProductSummary } from './summary';

export const steps: ProductFormStep[] = [
  {
    name: 'BasicInfo',
    label: 'Informações Básicas',
    component: <ProductBasicInfo key="StepBasicInfo" />,
    fields: ['name', 'sku', 'category']
  },
  {
    name: 'Attributes',
    label: 'Atributos',
    component: <ProductAttributes key="StepAttributes" />,
    fields: ['attributes']
  },
  {
    name: 'Variants',
    label: 'Variantes',
    component: <ProductVariants key="StepVariants" />,
    fields: ['variants']
  },
  {
    name: 'Summary',
    label: 'Resumo',
    component: <ProductSummary key="StepSummary" />
  }
];
