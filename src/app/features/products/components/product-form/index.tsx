import { useProductForm } from './hook';
import {
  Wizard,
  WizardContent,
  WizardControl,
  WizardHeader
} from '@/app/components/shared/wizard';

export function ProductForm({ label }: { label: string }) {
  const { steps, onSubmit, onCancel, handleNextStep } = useProductForm();

  return (
    <form className="space-y-6 h-full">
      <Wizard
        steps={steps}
        onBeforeNextStep={handleNextStep}
        onCancel={onCancel}
        onFinish={onSubmit}
      >
        <WizardHeader label={label} className="h-7" />
        <WizardContent />
        <WizardControl />
      </Wizard>
    </form>
  );
}
