import { z } from 'zod';

// Schema para o formulário de edição (campos de texto)
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

// Schema para a Server Action de atualização (texto puro)
export const compromissoSchema = z.object({
  pacienteNome: z.string().min(2),
  procedimento: z.string().min(1),
  telefone: z.string().min(14),
  descricao: z.string().min(1),
  dataMarcacao: z.date(),
});

// Schema para o formulário de CRIAÇÃO com Combobox (FK-based)
export const novoAgendamentoFormSchema = z.object({
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  procedimentoId: z.string().min(1, 'Selecione um procedimento'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
});

export type NovoAgendamentoFormData = z.infer<typeof novoAgendamentoFormSchema>;

// Schema para a Server Action de criação (FK-based)
export const criarCompromissoSchema = z.object({
  pacienteId: z.string().min(1),
  procedimentoId: z.string().min(1),
  descricao: z.string().min(1),
  dataMarcacao: z.date(),
});
