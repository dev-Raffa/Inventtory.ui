import { HardHat, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceholderPageProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PlaceholderPage({
  title = 'Página em Desenvolvimento',
  message = 'Esta funcionalidade ainda está sendo construída pela nossa equipe.',
  icon: Icon = HardHat,
  className
}: PlaceholderPageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-10 text-center animate-in fade-in zoom-in-95 duration-300',
        'min-h-[400px]',
        className
      )}
    >
      <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
        <Icon className="size-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}
