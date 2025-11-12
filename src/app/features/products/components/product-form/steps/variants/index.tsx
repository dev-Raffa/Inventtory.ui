import { useFieldArray } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/components/ui/table';
import { ProductFormFieldVariantImages } from './field-variant-images';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/app/components/ui/form';
import { useProductForm } from '../../hook';
import { Input } from '@/app/components/ui/input';

export function ProductVariants() {
  const { form, mode } = useProductForm();

  const { fields } = useFieldArray({
    control: form.control,
    name: 'variants'
  });

  if (fields.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Nenhuma variante gerada.</p>
        <p>Volte ao Passo 2 para adicionar atributos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Detalhes das Variantes</h3>
        <p className="text-sm text-muted-foreground">
          Preencha as informações para cada variação gerada.
        </p>
      </div>
      <div className="rounded-md border">
        <Table key={`product-variants-${form.getValues('name')}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Imagens</TableHead>
              <TableHead>Atributos</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estoque Mínimo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="flex gap-1">
                  <ProductFormFieldVariantImages
                    key={`variants.${index}.name`}
                    variantIndex={index}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <p>
                    {field.options?.map(
                      (opt, index) =>
                        `${opt.name} ${opt.value}${index < field.options.length - 1 ? ', ' : ''} `
                    )}
                  </p>
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="SKU da Variação"
                            disabled={mode === 'Create' ? false : true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.minimumStock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === '' ? null : +value);
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
