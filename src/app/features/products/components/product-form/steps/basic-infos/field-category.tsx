import { useState } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form';

import { useProductForm } from '../../hook';
import { useCategoriesQuery } from '@/app/features/category/hooks/use-query';

export function ProductFormFieldCategory() {
  const { data: categories } = useCategoriesQuery();
  const { form } = useProductForm();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatch = categories?.some(
    (cat) => cat.name.toLowerCase() === searchQuery.toLowerCase()
  );
  const showCreateOption = searchQuery.length > 0 && !exactMatch;

  return (
    <FormField
      control={form.control}
      name={'category'}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Categoria</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-between border-input text-sm font-normal bg-transparent selection:bg-primary selection:text-primary-foreground',
                    !field.value && 'text-muted-foreground '
                  )}
                >
                  {field.value?.name
                    ? field.value.name
                    : 'Selecione uma categoria'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
              <Command className="w-full">
                <CommandInput
                  placeholder="Pesquisar categoria..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>{'Nenhuma categoria encontrada.'}</CommandEmpty>

                  <CommandGroup>
                    {filteredCategories?.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={() => {
                          form.setValue('category', cat);
                          setOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            field.value?.name === cat.name
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {showCreateOption && (
                    <CommandGroup>
                      <CommandItem
                        value={searchQuery}
                        className="text-primary cursor-pointer"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar nova categoria: "{searchQuery}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
