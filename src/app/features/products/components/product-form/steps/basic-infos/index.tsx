import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { ProductFormFieldCategory } from './field-category';
import { useProductForm } from '../../hook';
import { ProductFormFieldImages } from './field-product-images';

export function ProductBasicInfo() {
  const { form, mode } = useProductForm();

  return (
    <div className="h-full grid grid-cols-1 gap-x-12 gap-5 md:grid-cols-2">
      <FormField
        control={form.control}
        name={'name'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Produto</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Camisa Social Slim Fit"
                disabled={mode === 'Create' ? false : true}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'sku'}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>SKU Principal</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: CS-SLIM-01"
                className="uppercase"
                disabled={mode === 'Create' ? false : true}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'minimumStock'}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Estoque mínimo</FormLabel>
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

      <ProductFormFieldCategory />

      <FormField
        control={form.control}
        name={'description'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none "
                placeholder="Descreva seu produto..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'hasVariants'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Este produto possui variações?</FormLabel>
            <div className="space-y-0.5 flex justify-between items-center border p-2 rounded-md">
              <FormDescription>
                Ex: Cores, Tamanhos, Voltagem, etc.
              </FormDescription>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={
                    mode === 'Edit' &&
                    !form.getFieldState('hasVariants').isDirty &&
                    field.value === true
                      ? true
                      : false
                  }
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <div className="col-span-2">
        <ProductFormFieldImages />
      </div>
    </div>
  );
}
