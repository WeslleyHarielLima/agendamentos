import { z } from 'zod';

export const compromissoFormSchema = z.object({
  pacienteNome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  procedimento: z.string().min(1, 'Procedimento é obrigatório'),
  telefone: z
    .string()
    .min(14, 'Telefone inválido — use o formato (00) 00000-0000'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
});

export type CompromissoFormData = z.infer<typeof compromissoFormSchema>;

export const compromissoSchema = z.object({
  pacienteNome: z.string().min(2),
  procedimento: z.string().min(1),
  telefone: z.string().min(14),
  descricao: z.string().min(1),
  dataMarcacao: z.date(),
});
