import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext
} from 'react';
import { useSearchParams } from 'react-router';
import type { WizardContextType, WizardRootProps, WizardStep } from '../types';

export const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({
  children,
  steps,
  urlParamKey = 'step',
  onBeforeNextStep,
  onFinish,
  onCancel
}: WizardRootProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const currentStepId = searchParams.get(urlParamKey);

  const currentStepIndex = useMemo(() => {
    if (!currentStepId) return 0;

    const foundIndex = steps.findIndex(
      (s: WizardStep) => s.id === currentStepId
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [currentStepId, steps]);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    const isUrlEmptyOrInvalid =
      !currentStepId ||
      steps.findIndex((s: WizardStep) => s.id === currentStepId) === -1;

    if (isUrlEmptyOrInvalid && steps.length > 0) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);

          newParams.set(urlParamKey, steps[0].id);

          return newParams;
        },

        { replace: true }
      );
    }
  }, [currentStepId, steps, urlParamKey, setSearchParams]);

  const changeStep = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= steps.length) return;

      const step = steps[newIndex];

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        newParams.set(urlParamKey, step.id);

        return newParams;
      });
    },

    [steps, urlParamKey, setSearchParams]
  );

  const nextStep = async () => {
    if (isLoading) return;

    setIsLoading(true);

    if (onBeforeNextStep) {
      const canProceed = await onBeforeNextStep(currentStep);

      if (!canProceed) return;
    }

    if (!isLastStep) {
      changeStep(currentStepIndex + 1);
    }

    setIsLoading(false);
  };

  const prevStep = () => {
    if (isFirstStep || isLoading) return;

    changeStep(currentStepIndex - 1);
  };

  const goToStep = (index: number) => {
    if (isLoading) return;

    changeStep(index);
  };

  const handleFinish = async () => {
    if (isLoading) return;

    setIsLoading(true);

    await onFinish?.();

    setIsLoading(false);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const value: WizardContextType = {
    state: {
      currentStep,
      currentStepIndex,
      totalSteps: steps.length,
      isFirstStep,
      isLastStep,
      isLoading
    },
    actions: {
      nextStep,
      prevStep,
      goToStep,
      handleCancel,
      handleFinish
    }
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);

  if (!context) {
    throw new Error(
      'useWizard deve ser usado dentro de um componente <Wizard>'
    );
  }

  return context;
}
