import type { ProductFormStep } from '../types';
import { ProductBasicInfo } from './basic-infos';
import { ProductAttributes } from './attributes';
import { ProductVariants } from './variants';
import { ProductSummary } from './summary';

export const stepsWithoutVariants: ProductFormStep[] = [
  {
    id: 'BasicInfo',
    label: 'Informações Básicas',
    component: <ProductBasicInfo key="StepBasicInfo" />
  },
  {
    id: 'Summary',
    label: 'Resumo',
    component: <ProductSummary key="StepSummary" />
  }
];

export const stepsWithVariants: ProductFormStep[] = [
  stepsWithoutVariants[0],
  {
    id: 'Attributes',
    label: 'Atributos',
    component: <ProductAttributes key="StepAttributes" />
  },
  {
    id: 'Variants',
    label: 'Variantes',
    component: <ProductVariants key="StepVariants" />
  },
  stepsWithoutVariants[1]
];
