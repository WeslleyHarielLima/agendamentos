import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

export const senhaSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Precisa de ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'Precisa de ao menos um número');

export type LoginInput = z.infer<typeof loginSchema>;
