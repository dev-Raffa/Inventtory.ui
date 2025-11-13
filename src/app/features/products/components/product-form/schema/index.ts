import { CategorySchema } from '@/app/features/category/schemas';
import { z } from 'zod';

export const attributeSchema = z.object({
  name: z.string().min(1, 'Nome do atributo é obrigatório.'),
  values: z
    .string()
    .min(1, 'Adicione pelo menos um valor (separado por vírgula).')
});

export const ProductImageFormSchema = z.object({
  id: z.string(),
  file: z
    .any()
    .refine(
      (val) =>
        val instanceof File || val === undefined || val === ({} as const),
      {
        message: `Input must be a File or an uploaded image object: `
      }
    )
    .optional(),
  name: z.string(),
  src: z.string(),
  type: z.string(),
  publicId: z.string().optional(),
  isPrimary: z.boolean().optional()
});

export const ProductVariantImageSchema = z.object({
  id: z.string(),
  isPrimary: z.boolean().optional()
});

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU da variação é obrigatório.'),
  minimumStock: z
    .number()
    .int()
    .min(0, 'Estoque mínimo deve ser 0 ou mais.')
    .default(0)
    .optional(),
  stock: z
    .number()
    .int()
    .min(0, 'Quantidade em estoque deve ser 0 ou mais.')
    .default(0)
    .optional(),
  options: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  ),
  images: z.array(ProductVariantImageSchema)
});

export const productSchemaWithVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  category: CategorySchema,
  minimumStock: z.number().int().default(0).optional(),
  stock: z.number().int().optional().default(0).optional(),
  hasVariants: z.literal(true),
  attributes: z
    .array(attributeSchema)
    .min(1, 'Deve conter pelo menos um atributo'),
  variants: z
    .array(variantSchema)
    .min(1, 'Deve conter pelo menos uma variante'),
  allImages: z.array(ProductImageFormSchema).optional()
});

export const productSchemaWithoutVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  category: CategorySchema,
  minimumStock: z.number().int().default(0).optional(),
  stock: z.number().int().optional().default(0).optional(),
  hasVariants: z.literal(false),
  allImages: z.array(ProductImageFormSchema).optional()
});

export const productSchema = z.discriminatedUnion('hasVariants', [
  productSchemaWithVariants,
  productSchemaWithoutVariants
]);

export type ProductFormData = z.infer<typeof productSchema>;
