import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useMovementForm } from '../../hooks';
import { Input } from '@/app/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/app/components/ui/form';
import type { MovementType } from '@/app/features/movements/types';

export function MovementFormHeader() {
  const { form, reasonOptions, actions } = useMovementForm();

  return (
    <header className="sticky top-0 z-10 mb-2 backdrop-blur pb-2">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between py-2">
          <section>
            <h1 className="text-xl font-bold text-green-950">
              Nova Movimentação
            </h1>
            <p className="text-muted-foreground">
              Registre todas as entradas, saídas e ajustes de inventário.
            </p>
          </section>
          <Button className="bg-red-800" size={'sm'} onClick={actions.cancel}>
            Cancelar
          </Button>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-6 gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <section className="col-span-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={(e) =>
                        actions.onChangeType(e as MovementType)
                      }
                      className="w-full"
                    >
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger
                          value="entry"
                          className="data-[state=active]:text-green-700"
                        >
                          Entrada
                        </TabsTrigger>
                        <TabsTrigger
                          value="withdrawal"
                          className="data-[state=active]:text-red-700"
                        >
                          Saída
                        </TabsTrigger>
                        <TabsTrigger
                          value="adjustment"
                          className="data-[state=active]:text-amber-700"
                        >
                          Ajuste
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <section className="flex gap-2 justify-center col-span-2">
            <div className="w-3/5">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'justify-start text-left font-normal w-full',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-1">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        step="1"
                        defaultValue="10:30:00"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>
          <section className="flex w-full">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonOptions.map((reason) => (
                        <SelectItem key={`reason-${reason}`} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </section>

          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Nº Documento"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </header>
  );
}
