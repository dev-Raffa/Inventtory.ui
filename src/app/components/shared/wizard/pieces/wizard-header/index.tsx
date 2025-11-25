import type { ComponentProps } from 'react';
import { useWizard } from '../../hooks';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/app/components/ui/breadcrumb';
import { Progress } from '@/app/components/ui/progress';

export function WizardHeader({
  className,
  label,
  ...props
}: { label?: string } & ComponentProps<'div'>) {
  const { state } = useWizard();

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <Breadcrumb className="mb-2">
        <BreadcrumbList className="sm:gap-1 items-center">
          <BreadcrumbItem>{label}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{state.currentStep?.label}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <Progress
        value={(100 / state.totalSteps) * (state.currentStepIndex + 1)}
      />
    </div>
  );
}
