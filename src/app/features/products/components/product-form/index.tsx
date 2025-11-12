import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/app/components/ui/breadcrumb';

import { useProductForm } from './hook';

export function ProductForm({ label }: { label: string }) {
  const {
    form,
    stepState,
    onSubmit,
    onCancel,
    handleNextStep,
    handlePrevStep
  } = useProductForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-full">
      <div className="h-7">
        <Breadcrumb className="mb-2">
          <BreadcrumbList className="sm:gap-1 items-center">
            <BreadcrumbItem>{label}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{stepState.currentStep?.label}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <Progress
          value={(100 / stepState.totalSteps) * (stepState.stepIndex + 1)}
        />
      </div>

      <Card className="p-6">{stepState.currentStep?.component}</Card>

      <div className="flex justify-between h-8">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={stepState.currentStep?.name === 'BasicInfo'}
        >
          Voltar
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-red-900 hover:bg-amber-800"
          >
            Cancelar
          </Button>
          {stepState.currentStep?.name === 'Summary' ? (
            <Button type="submit">Salvar Produto</Button>
          ) : (
            <Button type="button" onClick={(e) => handleNextStep(e)}>
              Avançar
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
