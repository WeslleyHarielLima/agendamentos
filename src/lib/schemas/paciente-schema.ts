import { z } from 'zod';

export const pacienteFormSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z
    .string()
    .min(14, 'Telefone inválido — use o formato (00) 00000-0000'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type PacienteFormData = z.infer<typeof pacienteFormSchema>;

export const pacienteSchema = z.object({
  nome: z.string().min(2),
  telefone: z.string().min(14),
  email: z.string().email().optional().or(z.literal('')),
});
