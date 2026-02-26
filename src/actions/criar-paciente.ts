'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { pacienteSchema } from '@/lib/schemas/paciente-schema';

type CriarPacienteInput = {
  nome: string;
  telefone: string;
  email?: string;
};

export async function criarPaciente(data: CriarPacienteInput) {
  const validated = pacienteSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    const paciente = await prisma.paciente.create({
      data: {
        nome: validated.data.nome,
        telefone: validated.data.telefone,
        email: validated.data.email || null,
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
