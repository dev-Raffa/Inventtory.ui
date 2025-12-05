import { Outlet } from 'react-router';
import { Quote } from 'lucide-react';

export function AuthLayout() {
  return (
    <>
      <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-40" />

          <div className="relative z-20 flex items-center gap-2 font-medium">
            {/* Logo repetido ou slogan aqui se quiser */}
          </div>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <div className="mb-4 rounded-full bg-white/10 w-fit p-2">
                <Quote className="h-6 w-6" />
              </div>
              <p className="text-lg">
                &ldquo;O Inventto transformou a maneira como gerenciamos nosso
                estoque. Deixamos de perder vendas por fura de estoque em menos
                de 3 meses de uso.&rdquo;
              </p>
              <footer className="text-sm text-zinc-400">
                Sofia Martinez, CEO da Modas & Cia
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="relative flex h-full flex-col bg-background p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] flex-1">
            <Outlet />

            <p className="px-8 text-center text-sm text-muted-foreground">
              Ao clicar em continuar, você concorda com nossos{' '}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
