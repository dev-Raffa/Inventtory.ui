import type { ReactNode } from 'react';

export interface WizardStep {
  id: string;
  label: string;
  component: ReactNode;
}

type WizardState = {
  currentStep: WizardStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
};

type WizardActions = {
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToStep: (index: number) => void;
  handleCancel: () => void;
  handleFinish: () => Promise<void>;
};

export interface WizardContextType {
  state: WizardState;
  actions: WizardActions;
}

export interface WizardRootProps {
  children: ReactNode;
  steps: WizardStep[];
  urlParamKey?: string;
  onBeforeNextStep?: (step: WizardStep) => Promise<boolean> | boolean;

  onFinish?: () => void | Promise<void>;
  onCancel?: () => void;
}
