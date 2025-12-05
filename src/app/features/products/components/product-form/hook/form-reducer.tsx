import { stepsWithoutVariants, stepsWithVariants } from '../steps';
import type { ProductFormStep } from '../types';

export interface ProductFormStepState {
  steps: ProductFormStep[];
}

type InitializeAction = {
  type: 'INITIALIZE';
  payload: { hasVariants: boolean };
};

type UpdateVariantModeAction = {
  type: 'UPDATE_VARIANT_MODE';
  payload: {
    hasVariants: boolean;
  };
};

type ProductFormStepAction = InitializeAction | UpdateVariantModeAction;

export const initialState = stepsWithVariants;

export function formReducer(
  steps: ProductFormStep[],
  action: ProductFormStepAction
): ProductFormStep[] {
  switch (action.type) {
    case 'INITIALIZE': {
      const { hasVariants } = action.payload;

      steps = hasVariants ? stepsWithVariants : stepsWithoutVariants;

      return steps;
    }

    case 'UPDATE_VARIANT_MODE': {
      const { hasVariants } = action.payload;

      steps = hasVariants ? stepsWithVariants : stepsWithoutVariants;

      return steps;
    }

    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Ação não tratada: ${exhaustiveCheck}`);
    }
  }
}
