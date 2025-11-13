import { describe, it, expect, vi, beforeEach } from 'vitest';
import { steps as mockSteps } from '../steps';
import {
  formReducer,
  initialState,
  type ProductFormStepState
} from './form-reducer';

vi.mock('../steps', () => ({
  steps: [
    { name: 'BasicInfo', label: 'Informações Básicas', component: null },
    { name: 'Attributes', label: 'Atributos', component: null },
    { name: 'Variants', label: 'Variantes', component: null },
    { name: 'Summary', label: 'Resumo', component: null }
  ]
}));

describe('formReducer', () => {
  let initializedState: ProductFormStepState;

  beforeEach(() => {
    initializedState = formReducer(initialState, {
      type: 'INITIALIZE',
      payload: { hasVariants: true }
    });
  });

  describe('INITIALIZE', () => {
    it('should return retornar all steps if hasVariants: true', () => {
      const state = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: true }
      });

      expect(state.allSteps.length).toBe(4);
      expect(state.totalSteps).toBe(4);
      expect(state.currentStep).toStrictEqual(mockSteps[0]);
    });

    it("should filter 'Attributes' and 'Variants' steps if hasVariants: false", () => {
      const state = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: false }
      });

      expect(state.allSteps.length).toBe(2);
      expect(state.totalSteps).toBe(2);
      expect(state.allSteps.map((s) => s.name)).toEqual([
        'BasicInfo',
        'Summary'
      ]);
      expect(state.currentStep).toStrictEqual(mockSteps[0]);
    });
  });

  describe('NEXT_STEP', () => {
    it('should increase stepIndex and update currentStep', () => {
      const state = formReducer(initializedState, { type: 'NEXT_STEP' });

      expect(state.stepIndex).toBe(1);
      expect(state.currentStep).toStrictEqual(mockSteps[1]);
    });

    it('should not increase if already in the first step', () => {
      const lastStepState = {
        ...initializedState,
        stepIndex: 3,
        currentStep: mockSteps[3]
      };

      const state = formReducer(lastStepState, { type: 'NEXT_STEP' });

      expect(state.stepIndex).toBe(3);
    });
  });

  describe('PREV_STEP', () => {
    it('should decrease stepIndex and update currentStep', () => {
      const secondStepState = {
        ...initializedState,
        stepIndex: 1,
        currentStep: mockSteps[1]
      };

      const state = formReducer(secondStepState, { type: 'PREV_STEP' });

      expect(state.stepIndex).toBe(0);
      expect(state.currentStep).toStrictEqual(mockSteps[0]);
    });

    it('should not decrease if already in the first step', () => {
      const state = formReducer(initializedState, { type: 'PREV_STEP' });
      expect(state.stepIndex).toBe(0);
    });
  });

  describe('GO_TO_STEP', () => {
    it('should proceed to the correct step upon receiving a payload with a valid name.', () => {
      const state = formReducer(initializedState, {
        type: 'GO_TO_STEP',
        payload: 'Summary'
      });

      expect(state.stepIndex).toBe(3);
      expect(state.currentStep?.name).toBe('Summary');
    });

    it('should not change the state if payload is a invalid step name', () => {
      const state = formReducer(initializedState, {
        type: 'GO_TO_STEP',
        payload: 'StepInexistente'
      });

      expect(state).toEqual(initializedState);
    });

    it('should not go to a filtered step when hasVariant: false.', () => {
      const noVariantState = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: false }
      });

      const state = formReducer(noVariantState, {
        type: 'GO_TO_STEP',
        payload: 'Variants'
      });

      expect(state).toEqual(noVariantState);
    });
  });

  describe('UPDATE_VARIANT_MODE', () => {
    it('must restart and filter the steps if hasVariants: false', () => {
      let state = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: true }
      });

      state = formReducer(state, { type: 'NEXT_STEP' });
      expect(state.stepIndex).toBe(1);

      state = formReducer(state, {
        type: 'UPDATE_VARIANT_MODE',
        payload: { hasVariants: false }
      });

      expect(state.stepIndex).toBe(0);
      expect(state.currentStep?.name).toBe('BasicInfo');
      expect(state.allSteps.length).toBe(2);
    });

    it('must restart and include all steps if hasVariants: true.', () => {
      let state = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: false }
      });
      expect(state.allSteps.length).toBe(2);

      state = formReducer(state, {
        type: 'UPDATE_VARIANT_MODE',
        payload: { hasVariants: true }
      });

      expect(state.stepIndex).toBe(0);
      expect(state.currentStep?.name).toBe('BasicInfo');
      expect(state.allSteps.length).toBe(4);
    });
  });

  describe('default (Exhaustive Check)', () => {
    it('should throw a error with the message "Ação não tratada" for an unhandled action', () => {
      const invalidAction = { type: 'INVALID_ACTION_TYPE' } as any;

      expect(() => formReducer(initializedState, invalidAction)).toThrow(
        /Ação não tratada/i
      );
    });
  });
});
