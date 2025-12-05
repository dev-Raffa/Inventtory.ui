import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { PasswordRequirement } from './password-requitements';
import { useSignUpForm } from '../../hook';

export function UserStep() {
  const { form } = useSignUpForm();
  const password = form.watch('password') || '';

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo</FormLabel>
            <FormControl>
              <Input placeholder="Seu nome" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input type="email" placeholder="seu@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
        <p className="font-medium mb-2">Requisitos da senha:</p>
        <PasswordRequirement
          isValid={hasMinLen}
          text="Mínimo de 8 caracteres"
        />
        <PasswordRequirement isValid={hasUpper} text="Uma letra maiúscula" />
        <PasswordRequirement isValid={hasNumber} text="Um número" />
        <PasswordRequirement
          isValid={hasSpecial}
          text="Um caractere especial (@, #, !, etc)"
        />
      </div>
    </div>
  );
}
