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
  const stepsHash = steps.map((s) => s.id).join(',');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepId, stepsHash, urlParamKey, setSearchParams]);

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

  const nextStep = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    if (onBeforeNextStep) {
      const canProceed = await onBeforeNextStep(currentStep);

      if (!canProceed) {
        setIsLoading(false);

        return;
      }
    }

    if (!isLastStep) {
      changeStep(currentStepIndex + 1);
    }

    setIsLoading(false);
  }, [
    isLoading,
    onBeforeNextStep,
    currentStep,
    isLastStep,
    changeStep,
    currentStepIndex
  ]);

  const prevStep = useCallback(() => {
    if (isFirstStep || isLoading) return;

    changeStep(currentStepIndex - 1);
  }, [isFirstStep, isLoading, changeStep, currentStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (isLoading) return;

      changeStep(index);
    },
    [isLoading, changeStep]
  );

  const handleFinish = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    await onFinish();

    setIsLoading(false);
  }, [isLoading, onFinish]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const value = useMemo<WizardContextType>(
    () => ({
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
    }),
    [
      currentStep,
      currentStepIndex,
      steps.length,
      isFirstStep,
      isLastStep,
      isLoading,
      nextStep,
      prevStep,
      goToStep,
      handleCancel,
      handleFinish
    ]
  );

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
