import { useFieldArray } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { ProductsFormFieldAttributeValues } from './field-attribute-values';
import { useProductForm } from '../../hook';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';

export function ProductAttributes() {
  const { form, mode } = useProductForm();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributes'
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Attributos</h3>
        <p className="text-sm text-muted-foreground">
          Atributos são características do seu produto, como tamanho ou cor.
          Você pode adicionar vários atributos ao seu produto.
        </p>
      </div>

      <div className="space-y-4 pt-8 flex flex-wrap gap-4">
        {fields.map((field, index) => {
          return (
            <Card
              key={field.id}
              className="relative overflow-hidden aspect-square py-2 gap-4 min-w-60 h-60 w-1/4"
            >
              {mode === 'Create' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Remover atributo"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <CardContent className="h-full flex flex-col justify-center items-center gap-4">
                <FormField
                  control={form.control}
                  name={`attributes.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex: Tamanho, Cor, Voltagem"
                          disabled={mode === 'Create' ? false : true}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ProductsFormFieldAttributeValues
                  name={`attributes.${index}.values`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', values: '' })}
        className="w-full md:w-auto"
      >
        + Adicionar atributo
      </Button>
    </div>
  );
}
