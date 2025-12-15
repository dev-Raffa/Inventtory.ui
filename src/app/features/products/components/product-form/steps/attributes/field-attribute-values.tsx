import { Input } from '@/app/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';
import { Badge } from '@/app/components/ui/badge';
import { useProductForm } from '../../hook';
import { parseValues } from '../../utils';

type TProductsFormFieldAttributeValues = {
  name: `attributes.${number}.values`;
};

export function ProductsFormFieldAttributeValues({
  name
}: TProductsFormFieldAttributeValues) {
  const { form } = useProductForm();
  const values = form.watch(name);
  const valuesArray = parseValues(values);

  return (
    <div>
      <FormField
        control={form.control}
        key={name}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valores</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: Pequeno, Medio, Grande (separados por vírgula)"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {valuesArray.map((value) => (
          <Badge key={value} variant="outline">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
}
