import { z } from 'zod';
import { normalizeDocument, validateDocument } from '@/lib/utils';

const slugRegex = /^[a-z0-9-]+$/;

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula.')
  .regex(/[0-9]/, 'Deve conter pelo menos um número.')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial.');

export const organizationSchema = z
  .object({
    companyName: z.string().min(2, 'O Nome Fantasia é obrigatório.'),
    document: z
      .string()
      .min(1, 'O documento é obrigatório.')
      .refine((val) => validateDocument(val), {
        message: 'Documento (CPF ou CNPJ) inválido.'
      }),
    corporateName: z.string().optional(),
    slug: z
      .string()
      .min(3, 'O slug deve ter pelo menos 3 caracteres.')
      .regex(
        slugRegex,
        'O slug deve conter apenas letras minúsculas, números e hifens.'
      )
  })
  .superRefine((data, ctx) => {
    const cleanDoc = normalizeDocument(data.document);
    const isCnpj = cleanDoc.length > 11;

    if (isCnpj && (!data.corporateName || data.corporateName.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'A Razão Social é obrigatória para CNPJ.',
        path: ['corporateName']
      });
    }
  });

export const userSchema = z
  .object({
    fullName: z.string().min(3, 'Informe seu nome completo.'),
    email: z.email('Informe um e-mail válido.'),
    password: passwordSchema,
    passwordConfirmation: z.string()
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não conferem.',
    path: ['passwordConfirmation']
  });

export const signUpSchema = z.intersection(organizationSchema, userSchema);

export type SignUpFormData = z.infer<typeof signUpSchema>;
