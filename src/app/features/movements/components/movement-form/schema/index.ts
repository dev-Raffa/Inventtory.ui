import { z } from 'zod';

export const movementItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productImage: z.string().optional(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  currentStock: z.number(),
  quantity: z.number().min(1, 'A quantidade deve ser maior que 0')
});

export const baseMovementSchema = z.object({
  type: z.enum(['entry', 'withdrawal', 'adjustment']),
  date: z.date({ error: 'Selecione uma data' }),
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
      'Horário inválido'
    ),
  reason: z.string().min(1, 'Selecione o motivo da movimentação'),
  documentNumber: z.string().optional(),
  items: z
    .array(movementItemSchema)
    .min(1, 'Adicione pelo menos um item à movimentação')
});

export const movementSchema = baseMovementSchema.superRefine((data, ctx) => {
  if (data.type === 'withdrawal') {
    data.items.forEach((item, index) => {
      if (item.quantity > item.currentStock) {
        ctx.addIssue({
          code: 'custom',
          message: `Quantidade indisponível (Máx: ${item.currentStock})`,
          path: ['items', index, 'quantity']
        });
      }
    });
  }
});

export type MovementFormData = z.infer<typeof movementSchema>;
