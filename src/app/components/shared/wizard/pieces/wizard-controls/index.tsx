import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import { useWizard } from '../../hooks';

interface WizardFooterProps extends ComponentProps<'div'> {
  labels?: {
    next?: string;
    back?: string;
    finish?: string;
    cancel?: string;
  };
}

export function WizardControl({
  className,
  labels,
  ...props
}: WizardFooterProps) {
  const { state, actions } = useWizard();

  return (
    <div
      className={cn('flex justify-between items-center mt-6', className)}
      {...props}
    >
      <div className="flex-1">
        {!state.isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={actions.prevStep}
            disabled={state.isLoading}
          >
            {labels?.back || 'Voltar'}
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={actions.handleCancel}
          disabled={state.isLoading}
          className="text-muted-foreground hover:text-destructive"
        >
          {labels?.cancel || 'Cancelar'}
        </Button>

        {state.isLastStep ? (
          <Button onClick={actions.handleFinish} disabled={state.isLoading}>
            {state.isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {labels?.finish || 'Finalizar'}
          </Button>
        ) : (
          <Button onClick={actions.nextStep} disabled={state.isLoading}>
            {state.isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {labels?.next || 'Avançar'}
          </Button>
        )}
      </div>
    </div>
  );
}
