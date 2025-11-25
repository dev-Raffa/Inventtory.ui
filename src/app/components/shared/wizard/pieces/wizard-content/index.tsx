import type { ComponentProps } from 'react';
import { useWizard } from '../../hooks';
import { Card } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';

export function WizardContent({ className, ...props }: ComponentProps<'div'>) {
  const { state } = useWizard();

  return (
    <Card className={cn('px-6', className)} {...props}>
      {state.currentStep?.component}
    </Card>
  );
}
