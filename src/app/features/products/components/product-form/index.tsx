import { useProductForm } from './hook';
import {
  Wizard,
  WizardContent,
  WizardControl,
  WizardHeader
} from '@/app/components/shared/wizard';

export function ProductForm({ label }: { label: string }) {
  const { form, steps, onSubmit, onCancel, handleNextStep } = useProductForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-full">
      <Wizard
        steps={steps}
        onBeforeNextStep={handleNextStep}
        onCancel={onCancel}
      >
        <WizardHeader label={label} className="h-7" />
        <WizardContent />
        <WizardControl />
      </Wizard>
    </form>
  );
}
