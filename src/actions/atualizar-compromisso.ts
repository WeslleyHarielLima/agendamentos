'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { compromissoSchema } from '@/lib/schemas/compromisso-schema';

type AtualizarCompromissoInput = {
  id: string;
  pacienteNome: string;
  procedimento: string;
  telefone: string;
  descricao: string;
  dataMarcacao: Date;
};

export async function atualizarCompromisso(data: AtualizarCompromissoInput) {
  const { id, ...rest } = data;
  const validated = compromissoSchema.safeParse(rest);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.compromisso.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[atualizarCompromisso]', error);
    return {
      success: false,
      error: 'Erro ao atualizar agendamento. Tente novamente.',
    };
  }
}
