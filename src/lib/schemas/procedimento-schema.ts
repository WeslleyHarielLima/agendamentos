import { z } from 'zod';

export const procedimentoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      'Valor deve ser um número positivo'
    ),
  descricao: z.string().optional(),
});

export type ProcedimentoFormData = z.infer<typeof procedimentoFormSchema>;

export const procedimentoSchema = z.object({
  nome: z.string().min(1),
  valor: z.number().positive(),
  descricao: z.string().optional(),
});
