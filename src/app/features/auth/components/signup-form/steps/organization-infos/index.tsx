import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { useSignUpForm } from '../../hook';

export function OrganizationStep() {
  const { form, isCnpj, actions } = useSignUpForm();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Inventto Logística"
                  {...field}
                  onChange={(e) =>
                    actions.handleCompanyNameChange(e.target.value)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Sistema</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    {...field}
                    className="rounded-r-none"
                    placeholder="inventto-logistica"
                  />
                  <span className="text-muted-foreground bg-muted border border-l-0 rounded-r-md px-3 py-2 text-sm">
                    .inventto.com/
                  </span>
                </div>
              </FormControl>
              <FormDescription>
                Identificador único para sua organização.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento (CPF ou CNPJ)</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  {...field}
                  maxLength={18}
                  onChange={(e) => {
                    actions.handleDocumentChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCnpj && (
          <FormField
            control={form.control}
            name="corporateName"
            render={({ field }) => (
              <FormItem className="animate-in zoom-in-95 duration-200">
                <FormLabel>Razão Social (Obrigatório para CNPJ)</FormLabel>
                <FormControl>
                  <Input placeholder="Razão Social Ltda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
