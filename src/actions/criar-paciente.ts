'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { pacienteSchema } from '@/lib/schemas/paciente-schema';

type CriarPacienteInput = {
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: string;
  telefone: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
};

export async function criarPaciente(data: CriarPacienteInput) {
  const validated = pacienteSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  const d = validated.data;

  try {
    const paciente = await prisma.paciente.create({
      data: {
        nome: d.nome,
        cpf: d.cpf || null,
        dataNascimento: d.dataNascimento ? new Date(d.dataNascimento) : null,
        sexo: (d.sexo as 'MASCULINO' | 'FEMININO' | 'OUTRO') || null,
        telefone: d.telefone,
        email: d.email || null,
        cep: d.cep || null,
        logradouro: d.logradouro || null,
        numero: d.numero || null,
        complemento: d.complemento || null,
        bairro: d.bairro || null,
        cidade: d.cidade || null,
        estado: d.estado || null,
        observacoes: d.observacoes || null,
      },
    });

    revalidatePath('/pacientes');

    return {
      success: true as const,
      data: {
        id: paciente.id,
        nome: paciente.nome,
        telefone: paciente.telefone,
        email: paciente.email,
      },
    };
  } catch (error) {
    console.error('[criarPaciente]', error);
    return {
      success: false as const,
      error: 'Erro ao salvar paciente. Tente novamente.',
    };
  }
}
