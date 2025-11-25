import { describe, it, expect, vi } from 'vitest';
import { formReducer } from './form-reducer';
import type { ProductFormStep } from '../types';

const { mockAllSteps, mockSimpleSteps } = vi.hoisted(() => {
  const mockAllSteps: ProductFormStep[] = [
    { id: 'BasicInfo', label: 'Informações Básicas', component: null },
    { id: 'Attributes', label: 'Atributos', component: null },
    { id: 'Variants', label: 'Variantes', component: null },
    { id: 'Summary', label: 'Resumo', component: null }
  ];

  const mockSimpleSteps = [mockAllSteps[0], mockAllSteps[3]];

  return {
    mockAllSteps,
    mockSimpleSteps
  };
});

vi.mock('../steps', () => ({
  stepsWithVariants: mockAllSteps,
  stepsWithoutVariants: mockSimpleSteps
}));

describe('formReducer', () => {
  const initialState = mockAllSteps;

  describe('INITIALIZE', () => {
    it('should return all steps if hasVariants is true', () => {
      const result = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: true }
      });

      expect(result).toHaveLength(4);
      expect(result).toEqual(mockAllSteps);
    });

    it('should return filtered steps (no variants) if hasVariants is false', () => {
      const result = formReducer(initialState, {
        type: 'INITIALIZE',
        payload: { hasVariants: false }
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockSimpleSteps);
    });
  });

  describe('UPDATE_VARIANT_MODE', () => {
    it('should return all steps when switching to variant mode (true)', () => {
      const result = formReducer(mockSimpleSteps, {
        type: 'UPDATE_VARIANT_MODE',
        payload: { hasVariants: true }
      });

      expect(result).toHaveLength(4);
      expect(result).toEqual(mockAllSteps);
    });

    it('should return filtered steps when switching to simple mode (false)', () => {
      const result = formReducer(mockAllSteps, {
        type: 'UPDATE_VARIANT_MODE',
        payload: { hasVariants: false }
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockSimpleSteps);
    });
  });

  describe('default (Exhaustive Check)', () => {
    it('should throw an error for unhandled actions', () => {
      const invalidAction = { type: 'INVALID_ACTION' } as any;

      expect(() => formReducer(initialState, invalidAction)).toThrow(
        /Ação não tratada/i
      );
    });
  });
});
