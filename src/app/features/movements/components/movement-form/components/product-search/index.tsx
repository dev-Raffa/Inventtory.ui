'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';
import { Button } from '@/app/components/ui/button';
import type { IProduct } from '@/app/features/products/types';

interface ProductSearchProps {
  products: IProduct[];
  onSelect: (product: IProduct) => void;
}

export function ProductSearch({ products, onSelect }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-14 justify-start text-lg px-4 text-muted-foreground font-normal bg-transparent"
        >
          <Search className="mr-2 h-5 w-5" />
          {value
            ? products.find((p) => p.name === value)?.name
            : 'Buscar produto por nome ou SKU...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar produto..." />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    setValue('');
                    onSelect(product);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                    <img
                      src={product.allImages?.[0].src || '/placeholder.svg'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.sku}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
