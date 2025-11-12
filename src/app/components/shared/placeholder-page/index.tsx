import { HardHat } from 'lucide-react';

export function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-10 min-h-[400px]">
      <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
        <HardHat className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-green-950 mb-2">
        Página em Desenvolvimento
      </h2>
      <p className="text-muted-foreground max-w-md text-center">
        Esta funcionalidade ainda está sendo construída pela nossa equipe. Volte
        em breve para conferir as novidades!
      </p>
    </div>
  );
}
