import { z } from 'zod';

const optional = z.string().optional().or(z.literal(''));

export const pacienteFormSchema = z.object({
  // Dados pessoais
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: optional,
  dataNascimento: optional,
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional().or(z.literal('')),

  // Contato
  telefone: z
    .string()
    .min(14, 'Telefone inválido — use o formato (00) 00000-0000'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),

  // Endereço
  cep: optional,
  logradouro: optional,
  numero: optional,
  complemento: optional,
  bairro: optional,
  cidade: optional,
  estado: z
    .string()
    .max(2, 'Use a sigla do estado (ex: SP)')
    .optional()
    .or(z.literal('')),

  // Clínico
  observacoes: optional,
});

export type PacienteFormData = z.infer<typeof pacienteFormSchema>;

export const pacienteSchema = pacienteFormSchema;
