'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { pacienteSchema } from '@/lib/schemas/paciente-schema';

type AtualizarPacienteInput = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
};

export async function atualizarPaciente(data: AtualizarPacienteInput) {
  const { id, ...rest } = data;
  const validated = pacienteSchema.safeParse(rest);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.paciente.update({
      where: { id },
      data: {
        nome: validated.data.nome,
        telefone: validated.data.telefone,
        email: validated.data.email || null,
      },
    });

    revalidatePath('/pacientes');

    return { success: true };
  } catch (error) {
    console.error('[atualizarPaciente]', error);
    return {
      success: false,
      error: 'Erro ao atualizar paciente. Tente novamente.',
    };
  }
}
