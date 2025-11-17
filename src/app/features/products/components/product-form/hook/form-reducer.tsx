import { steps } from '../steps';
import type { ProductFormStep } from '../types';

export interface ProductFormStepState {
  stepIndex: number;
  totalSteps: number;
  currentStep: ProductFormStep | null;
  allSteps: ProductFormStep[];
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

type NextStepAction = {
  type: 'NEXT_STEP';
};
type PrevStepAction = {
  type: 'PREV_STEP';
};

type GoToStepAction = {
  type: 'GO_TO_STEP';
  payload: string;
};

type ProductFormStepAction =
  | InitializeAction
  | UpdateVariantModeAction
  | NextStepAction
  | PrevStepAction
  | GoToStepAction;

export const initialState = {
  stepIndex: 0,
  totalSteps: 0,
  currentStep: null,
  allSteps: steps
};

export function formReducer(
  state: ProductFormStepState,
  action: ProductFormStepAction
): ProductFormStepState {
  const stepsWithoutVariants = steps.filter(
    (step) => step.name !== 'Attributes' && step.name !== 'Variants'
  );

  switch (action.type) {
    case 'INITIALIZE': {
      const { hasVariants } = action.payload;

      return {
        stepIndex: 0,
        allSteps: hasVariants ? steps : stepsWithoutVariants,
        totalSteps: hasVariants ? steps.length : stepsWithoutVariants.length,
        currentStep: steps[0]
      };
    }

    case 'UPDATE_VARIANT_MODE': {
      const { hasVariants } = action.payload;

      return {
        stepIndex: 0,
        allSteps: hasVariants ? steps : stepsWithoutVariants,
        totalSteps: hasVariants ? steps.length : stepsWithoutVariants.length,
        currentStep: steps[0]
      };
    }

    case 'NEXT_STEP': {
      if (state.stepIndex >= state.totalSteps - 1) {
        return state;
      }

      const newIndex = state.stepIndex + 1;

      return {
        ...state,
        stepIndex: newIndex,
        currentStep: state.allSteps[newIndex]
      };
    }

    case 'PREV_STEP': {
      if (state.stepIndex <= 0) {
        return state;
      }

      const newIndex = state.stepIndex - 1;

      return {
        ...state,
        stepIndex: newIndex,
        currentStep: state.allSteps[newIndex]
      };
    }

    case 'GO_TO_STEP': {
      const stepIndex = state.allSteps.findIndex(
        (s) => s.name === action.payload
      );

      if (stepIndex === -1) {
        return state;
      }

      return {
        ...state,
        currentStep: state.allSteps[stepIndex],
        stepIndex: stepIndex
      };
    }

    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Ação não tratada: ${exhaustiveCheck}`);
    }
  }
}
