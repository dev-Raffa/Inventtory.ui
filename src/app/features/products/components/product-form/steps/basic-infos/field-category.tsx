import { Check, ChevronsUpDown, PlusCircle, Loader2 } from 'lucide-react';
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
import { useCategoryField } from './use-category-field';

export function ProductFormFieldCategory() {
  const { form } = useProductForm();
  const {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    filteredCategories,
    showCreateOption,
    isCreating,
    handleCreateCategory
  } = useCategoryField({
    onSelect: (newCategory) => form.setValue('category', newCategory)
  });

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
                    !field.value?.name && 'text-muted-foreground'
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
                  <CommandEmpty>
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                      </span>
                    ) : (
                      'Nenhuma categoria encontrada.'
                    )}
                  </CommandEmpty>

                  <CommandGroup>
                    {filteredCategories.map((cat) => (
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

                  {showCreateOption && !isCreating && (
                    <CommandGroup>
                      <CommandItem
                        value={searchQuery}
                        onSelect={handleCreateCategory}
                        className="text-green-700 cursor-pointer font-medium"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar nova: "{searchQuery}"
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
