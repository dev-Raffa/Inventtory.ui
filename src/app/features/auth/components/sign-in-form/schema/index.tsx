import z from 'zod';

export const signInSchema = z.object({
  email: z.email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.')
});

export type SignInFormData = z.infer<typeof signInSchema>;
