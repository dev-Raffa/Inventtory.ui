import { z } from 'zod';
import { passwordSchema } from '@/app/features/auth/components/signup-form/schema';

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
